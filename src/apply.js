import "@fortawesome/fontawesome-free";

import "bootstrap";

import flatpickr from "flatpickr";
import "flatpickr/dist/l10n/ja.js";

import "url-search-params-polyfill";

import * as rv from "./HTMLFormElement-HTMLInputElement.reportValidity";
import * as find from "./defineFindPolyfill";

// URLの商品名によってフォームの見た目を変更する
$(() => {
    const product_name = getUrlParam("product");
    let css_path = "./styles/form_lagless.css";
    switch (product_name) {
    case "dandori":
        css_path = "./styles/form_dandori.css";
        break;
    case "renove":
        css_path = "./styles/form_renove.css";
        break;
    // それ以外はlaglessとする
    }
    $("#product-css").attr("href", css_path);
});

// URLの工務店IDパラメータを引き継ぐ
$(() => {
    const id_key = "c";
    const id_val = getUrlParam(id_key);

    $("#constructionShopId").val(id_val);
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

// URLから指定したパラメータを取得する
export function getUrlParam(param_name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param_name);
}

// 2回目以降申込みフォームで不要なコントロールの必須チェックを外してフォームから非表示にする
function hideObjects(objects) {
    cancelValidation(objects);
    objects.hide();
}

// 必須入力項目を任意入力に変更する
function arbitrariseInput() {
    $("div[name=arbitrary_second]").each(function() {
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

// 日付入力欄でカレンダーからの入力を可能にする
$(() => {
    flatpickr.l10ns.ja.firstDayOfWeek = 0;
    flatpickr("#closingDay", {
        "dateFormat": "Y-m-d",
        "locale": "ja"
    });
});

// コントロール未入力のまま次に行こうとしたら警告を出す
$(() => {
    $(".no-blank").blur(blank_validate);
    $(".pattern-required").blur(function () {pattern_validate($(this));});

    // 下記クラス.pattern-required-on-modifiedのバリデーションは、次のようになる
    // 1. 初回フォームであれば無条件でblur時にパターンマッチのvalidate
    // 2-1. 2回目以降フォームであればblur時にブランクならOK判定
    // 2-2. 2回目以降フォームであればblur時に非ブランクならパターンマッチのvalidate
    $(".pattern-required-on-modified").blur(function() {
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
            .blur(function () {pattern_validate($(this));})
            .blur();

        $("input[name=bankName_Form]").addClass("no-blank")
            .blur(blank_validate)
            .blur();

        $("input[name=branchCode_Form]").addClass("pattern-required")
            .blur(function () {pattern_validate($(this));})
            .blur();

        $("input[name=branchName_Form]").addClass("no-blank")
            .blur(blank_validate)
            .blur();
    });
});

$(() => {
    $(".bank-info").blur(function() {
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
    $("#send").click(function(event){
    // formのデフォルトのsubmit挙動を止めて、独自にsubmit挙動を実装
        event.preventDefault();

        rv.defineReportValidityPolyfill();

        // ブランクチェックなど
        if(!this.form.reportValidity()) {
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

        const form_data = new FormData($("#form_id")[0]);

        if (isSafari()) {
            // 添付ファイルが空の場合は要素を削除。削除しないとSafariで不具合が出る
            $("input[type=file]").each((i, j) => {
                const name = $(j).attr("name");
                if(!$(`[name=${  name  }]`).val()) {
                    form_data.delete(name);
                }
            });
        }

        // 多重送信防止
        showSending("送信中...");
        $("#send").text("送信中...")
            .prop("disabled", true);

        // データ送信。kintone用のデータ変換はfirebase側
        $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: "https://us-central1-lagless.cloudfunctions.net/send_apply",
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

function showSending(msg){
    // 引数なし（メッセージなし）を許容
    if( msg == undefined ){
        msg = "";
    }
    // 画面表示メッセージ
    $("#sending>.sendingMsg").text(msg);
    $("#sending").show();
}

function hideSending(){
    $("#sending").hide();
}
