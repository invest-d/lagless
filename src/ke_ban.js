import "../public/rollbar/rollbar";

import "@fortawesome/fontawesome-free";

import "bootstrap";

import $ from "jquery";

import "url-search-params-polyfill";

import * as rv from "./HTMLFormElement-HTMLInputElement.reportValidity";
import * as find from "./defineFindPolyfill";

import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

export const getTodayDate = () => {
    const specified_date = (() => {
        if (getUrlParam("debug_date") == "random") {
            const min = 1606748400; // 2020年12月01日
            const max = 1638284400; // 2021年12月01日
            const random_integer = Math.floor(Math.random() * (max + 1 - min)) + min;
            return dayjs.unix(random_integer);
        } else {
            return dayjs(getUrlParam("debug_date"));
        }
    })();
    if (specified_date.isValid()) {
        // デバッグ用。パラメータに日付を書くことで、「ブラウザを開いたときの日付」を変更できる
        console.log(`debug mode: today is ${specified_date.format("YYYY-MM-DD")}`);
        return specified_date;
    } else {
        return dayjs();
    }
};

export const get_pay_term_start_date = (base_date) => {
    // target_dateが属する申込可能な稼働期間の開始日を取得する
    let start_date = base_date;
    while (start_date.date() % 5 !== 1) {
        start_date = start_date.subtract(1, "day");
    }
    return start_date;
};
export const get_pay_term_end_date = (base_date) => {
    // base_dateが属する申込可能な稼働期間の終了日を取得する
    if (get_pay_term_start_date(base_date).date() === 26) {
        // 最終タームの場合、前払い対象の終了日は月末
        return base_date.endOf("month");
    } else {
        let end_date = base_date;
        while (end_date.date() % 5 !== 0) {
            end_date = end_date.add(1, "day");
        }
        return end_date;
    }
};
export const get_next_business_date = (base_date) => {
    let next_date = base_date.add(1, "day");
    while([0, 6].includes(next_date.day())) {
        next_date = next_date.add(1, "day");
    }
    return next_date;
};

export const get_terms_before_and_after = (today) => {
    // 前払い可能な期間は原則的に5日ごとの区切り。
    // 1日～5日、6日～10日、……、21日〜25日。
    // 前払い可能な期間の開始日の翌日から終了日の翌営業日までが申込期間。
    // 現在の日付が属する五十日について、開始日と終了日を求める
    const terms = {
        prev: {
            pay: {
                start: null,
                end: null
            },
            apply: {
                start: null,
                end: null
            }
        },
        now: {
            pay: {
                start: null,
                end: null
            },
            apply: {
                start: null,
                end: null
            }
        },
        next: {
            pay: {
                start: null,
                end: null
            },
            apply: {
                start: null,
                end: null
            }
        }
    };

    terms.now.pay.start = get_pay_term_start_date(today);
    terms.now.pay.end = get_pay_term_end_date(today);

    // 現在の五十日の直前の五十日について、開始日と終了日を求める
    terms.prev.pay.start = get_pay_term_start_date(terms.now.pay.start.subtract(1, "day"));
    terms.prev.pay.end = get_pay_term_end_date(terms.now.pay.start.subtract(1, "day"));

    // 現在の五十日の直後の五十日について、開始日と終了日を求める
    terms.next.pay.start = get_pay_term_start_date(terms.now.pay.end.add(1, "day"));
    terms.next.pay.end = get_pay_term_end_date(terms.now.pay.end.add(1, "day"));

    // それぞれの五十日について、申込可能期間を求める
    // 申込可能期間の開始日は常に五十日の開始日に等しい
    terms.prev.apply.start = terms.prev.pay.start;
    terms.now.apply.start = terms.now.pay.start;
    terms.next.apply.start = terms.next.pay.start;
    // 申込可能期間の終了日は五十日の終了日の翌営業日
    terms.prev.apply.end = get_next_business_date(terms.prev.pay.end);
    terms.now.apply.end = get_next_business_date(terms.now.pay.end);
    terms.next.apply.end = get_next_business_date(terms.next.pay.end);

    return terms;
};

// フォームを開いた時点において、前払対象になる期間を確定する
$(() => {
    // ページを開く度に前払い期間と申込期間のテーブルを用意する。
    // 現在の日付が当てはまっている申込期間の数だけ前払い期間のドロップダウンを生成する。

    // 26日〜月末日の期間については申込対象外。
    // 申込対象外の期間だけがドロップダウンに表示される場合に限り、「現在お申込み頂ける稼働期間はございません。」と表示。
    const today = getTodayDate();
    const terms = get_terms_before_and_after(today);

    // 現在の日付がどの申込期間に入っているかを判定して、選択肢に加えていく
    const choice_phrases = [];
    if (today.isBetween(terms.prev.apply.start, terms.prev.apply.end, null, "[]")) {
        choice_phrases.push(`${terms.prev.pay.start.format("YYYY年MM月DD日")}から${terms.prev.pay.end.format("YYYY年MM月DD日")}まで`);
    }

    if (today.isBetween(terms.now.apply.start, terms.now.apply.end, null, "[]")) {
        choice_phrases.push(`${terms.now.pay.start.format("YYYY年MM月DD日")}から${terms.now.pay.end.format("YYYY年MM月DD日")}まで`);
    }

    if (today.isBetween(terms.next.apply.start, terms.next.apply.end, null, "[]")) {
        choice_phrases.push(`${terms.next.pay.start.format("YYYY年MM月DD日")}から${terms.next.pay.end.format("YYYY年MM月DD日")}まで`);
    }

    // 不可能な期間を除外
    const selectable = choice_phrases.filter((p) => !p.includes("26日から"));

    const term_select = $("#targetTerm");
    selectable.forEach((item) => {
        const option = $("<option>");
        option.attr("value", item);
        option.text(item);
        term_select.append(option);
    });

    // 選択可能な期間がない場合はその旨の選択肢を表示する
    if (term_select.children().length === 0) {
        const unavailable_option = $("<option>");
        const unavailable_message = "現在お申込み頂ける稼働期間はございません。";
        unavailable_option.attr("value", unavailable_message);
        unavailable_option.text(unavailable_message);
        term_select.append(unavailable_option);

        // 画面全体を非表示にもする
        $("#form_id").addClass("d-none");
        $("#unavailable").removeClass("d-none");
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

// URLから指定したパラメータを取得する。パラメータが見つからなければ null を返す
function getUrlParam(param_name) {
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

        // 多重送信防止
        showSending("送信中...");
        $("#send").text("送信中...")
            .prop("disabled", true);

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
