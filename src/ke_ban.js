import "../public/rollbar/rollbar";

import $ from "jquery";
import * as rv from "./HTMLFormElement-HTMLInputElement.reportValidity";
import * as find from "./defineFindPolyfill";

import {
    getUrlParam
} from "./logics/common";

import {
    TODAY,
    get_terms_prev_now_next,
    get_available_terms,
    SERVICE_START_DATE
} from "./logics/ke_ban";

import { defineIncludesPolyfill } from "./defineIncludesPolyfill";
defineIncludesPolyfill();

// フォームを開いた時点において、前払対象になる期間を確定する
$(() => {
    // ページを開く度に前払い期間と申込期間のテーブルを用意する。
    // 現在の日付が当てはまっている申込期間の数だけ前払い期間のドロップダウンを生成する。

    const terms = get_terms_prev_now_next(TODAY);
    const display_terms = [];
    for (const term of get_available_terms(terms, TODAY)) {
        display_terms.push(`${term.pay.start.format("YYYY年MM月DD日")}から${term.pay.end.format("YYYY年MM月DD日")}まで`);
    }

    const term_select = $("#targetTerm");
    display_terms.forEach((item) => {
        const option = $("<option>");
        option.attr("value", item);
        option.text(item);
        term_select.append(option);
    });

    // 1. 申込対象外の期間だけがドロップダウンに表示される場合
    // 2. START_DATEよりも前の日時の場合
    // 上記いずれかに当てはまる場合、「現在お申込み頂ける稼働期間はございません。」と表示。
    const exist_available_terms = term_select.children().length === 0;
    if (exist_available_terms || TODAY.isBefore(SERVICE_START_DATE)) {
        const unavailable_option = $("<option>");
        const unavailable_message = "現在お申込み頂ける稼働期間はございません。";
        unavailable_option.attr("value", unavailable_message);
        unavailable_option.text(unavailable_message);
        term_select.append(unavailable_option);

        // 画面全体を非表示にもする
        $("#form_id").addClass("d-none");
        $("#unavailable").removeClass("d-none");
        // サービス開始日時より前の場合は1月スタートである旨を補足
        if (TODAY.isBefore(SERVICE_START_DATE)) {
            const message = `${$("#unavailable-message").text()}\r\n※2021年01月01日から本サービスをご利用頂けます`;
            // 改行を反映させたいのでinnerText
            $("#unavailable-message").get(0).innerText = message;
        }
    }
});

// URLのパラメータによって初回のフォームもしくは2回目以降のフォームにする
$(() => {
    const key = "user";
    const val = getUrlParam(key);
    if (val === "existing") {
        // 2回目以降の申込みフォーム
        // 初回のみ必須入力の項目を非表示にする
        const objects = $("*[name=only_first]");
        hideObjects(objects);
        // 2回目以降は任意入力になる項目を設定する
        arbitrariseInput();
        // 2回目以降で表示するキャプションを設定
        $("#second_caption").show();
    } else {
        // 初回申込みフォーム
        // 特に変更する必要はない
    }
});

// 2回目以降申込みフォームで不要なコントロールの必須チェックを外してフォームから非表示にする
function hideObjects(objects) {
    cancelValidation(objects);
    objects.hide();
}

// 必須入力項目を任意入力に変更する
function arbitrariseInput() {
    $("div[name=arbitrary_second]").each(function () {
        // 必須のラベルを任意に変更
        $(this).find("span.badge").removeClass("badge-danger")
            .addClass("badge-secondary")
            .text("任意");

        // ブランクのまま送信は許すが、入力するなら入力可能パターンはチェックする
        $(this).find("input, select").removeClass("no-blank")
            .prop("required", false);
    });
}

function cancelValidation(objects) {
    objects.find("input").removeClass("no-blank pattern-required")
        .prop("required", false);
}

// コントロール未入力のまま次に行こうとしたら警告を出す
$(() => {
    $(".no-blank").blur(blank_validate);
    $(".pattern-required").blur(function () { pattern_validate($(this)); });

    // 下記クラス.pattern-required-on-modifiedのバリデーションは、次のようになる
    // 1. 初回フォームであれば無条件でblur時にパターンマッチのvalidate
    // 2-1. 2回目以降フォームであればblur時にブランクならOK判定
    // 2-2. 2回目以降フォームであればblur時に非ブランクならパターンマッチのvalidate
    $(".pattern-required-on-modified").blur(function () {
        pattern_validate($(this), getUrlParam("user") === "existing");
    });
});

function blank_validate() {
    if ($(this).val()) {
        $(this).removeClass("border border-danger")
            .addClass("border border-success");
        $(this).nextAll(".valid-input").show();
        $(this).nextAll(".invalid-input").hide();
        $(this).nextAll(".invalid-feedback").hide();
    } else {
        $(this).removeClass("border border-success")
            .addClass("border border-danger");
        $(this).nextAll(".valid-input").hide();
        $(this).nextAll(".invalid-input").show();
        $(this).nextAll(".invalid-feedback").show();
    }
}

function pattern_validate(obj, blank_allowed) {
    const pattern = new RegExp(obj.attr("pattern"));

    const input_is_valid = pattern.test(obj.val());
    const input_is_blank = (obj.val() == "");
    if (input_is_valid
        || (blank_allowed && input_is_blank)) {
        // 有効な入力
        obj.removeClass("invalid-pattern").addClass("valid-pattern");
        obj.nextAll(".valid-input").show();
        obj.nextAll(".invalid-input").hide();
        obj.nextAll(".invalid-feedback").hide();
    } else {
        // 無効な入力
        obj.removeClass("valid-pattern").addClass("invalid-pattern");
        obj.nextAll(".valid-input").hide();
        obj.nextAll(".invalid-input").show();
        obj.nextAll(".invalid-feedback").show();
    }
}

// ライブラリから銀行情報を入力したときに正しくバリデーションがかからないので、預金種目をクリックした時にチェックする
$(() => {
    $("input[name=deposit_Form]").on("click", () => {
        $("input[name=bankCode_Form]").addClass("pattern-required")
            .blur(function () { pattern_validate($(this)); })
            .blur();

        $("input[name=bankName_Form]").addClass("no-blank")
            .blur(blank_validate)
            .blur();

        $("input[name=branchCode_Form]").addClass("pattern-required")
            .blur(function () { pattern_validate($(this)); })
            .blur();

        $("input[name=branchName_Form]").addClass("no-blank")
            .blur(blank_validate)
            .blur();
    });
});

$(() => {
    $(".bank-info").blur(function () {
        const pattern = new RegExp($(this).attr("pattern"));
        if (pattern.test($(this).val())) {
            $(this).removeClass("invalid-pattern").addClass("valid-pattern");
            $(this).nextAll(".valid-input").show();
            $(this).nextAll(".invalid-input").hide();
            $(this).nextAll(".invalid-feedback").hide();
        } else {
            $(this).removeClass("valid-pattern").addClass("invalid-pattern");
            $(this).nextAll(".valid-input").hide();
            $(this).nextAll(".invalid-input").show();
            $(this).nextAll(".invalid-feedback").hide();
        }
    });
});

// 規約に同意するチェックをしていない場合に送信をタップしたらアラートを出す
$(() => {
    $("#form_id").submit(() => {
        if (!($("#agree").is(":checked"))) {
            alert("お申込みするには「規約に同意する」にチェックしてください。");
            return false;
        }
    });
});

// 送信ボタンをクリックしたときの挙動
$(() => {
    $("#send").click(function (event) {
        // formのデフォルトのsubmit挙動を止めて、独自にsubmit挙動を実装
        event.preventDefault();

        rv.defineReportValidityPolyfill();

        // ブランクチェックなど
        if (!this.form.reportValidity()) {
            $("#report-validity").show();
            return;
        }

        $("#report-validity").hide();

        find.definePolyfill();

        // 添付ファイルのファイルサイズが大きすぎるとサーバーエラーになるため、送信できないようにする。
        const FILE_SIZE_LIMIT = 4 * Math.pow(1024, 2);
        // Byte数で取得。既存ユーザのときは添付ファイルが必要ない項目があるので、それは無視する
        const inputs = $.makeArray($("input[type='file']").filter((i, elem) => $(elem).val() != ""));
        const over_input = inputs.find((input) => input.files[0].size >= FILE_SIZE_LIMIT);
        if (over_input !== undefined) {
            // alertに表示するため、inputに対応するラベルを取得
            const label_text = $(`label[for='${over_input.id}']`).text();
            alert(`${label_text}のファイル容量を${FILE_SIZE_LIMIT / Math.pow(1024, 2)}MBより小さくしてください。\n`
                + `現在のファイル容量：およそ${(over_input.files[0].size / Math.pow(1024, 2)).toPrecision(2)}MB`);
            return;
        }

        // 多重送信防止
        showSending("送信中...");
        $("#send").text("送信中...")
            .prop("disabled", true);

        const form_data = new FormData($("#form_id")[0]);

        if (isSafari()) {
            // 添付ファイルが空の場合は要素を削除。削除しないとSafariで不具合が出る
            $("input[type=file]").each((i, j) => {
                const name = $(j).attr("name");
                if (!$(`[name=${name}]`).val()) {
                    form_data.delete(name);
                }
            });
        }

        // データ送信。kintone用のデータ変換はfirebase側
        $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: ENV.ke_ban_endpoint,
            dataType: "json",
            data: form_data,
            cache: false,
            processData: false,
            contentType: false
        })
            .done((data) => {
                // 成功時のレスポンスでは完了画面のURLが飛んでくるので、そこに移動する
                window.location.href = String(data["redirect"]);
            })
            .fail((data) => {
                // 失敗時はアラートを出すだけ。ページ遷移しない。フォームの入力内容もそのまま
                console.error(JSON.stringify(data));
                hideSending();
                $("#send").text("送信")
                    .prop("disabled", false);
                alert(`登録に失敗しました。\n${data.responseJSON.message}`);
            });
    });
});

function isSafari() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1) {
        // ie
    } else if (userAgent.indexOf("edge") != -1) {
        // edge
    } else if (userAgent.indexOf("chrome") != -1) {
        // chrome
    } else if (userAgent.indexOf("safari") != -1) {
        // safari
        return true;
    }

    // それ以外
    return false;
}

function showSending(msg) {
    // 引数なし（メッセージなし）を許容
    if (msg == undefined) {
        msg = "";
    }
    // 画面表示メッセージ
    $("#sending>.sendingMsg").text(msg);
    $("#sending").show();
}

function hideSending() {
    $("#sending").hide();
}
