import "@fortawesome/fontawesome-free";

import "bootstrap";

import "flatpickr";
import "flatpickr/dist/l10n/ja.js";
import flatpickr from "flatpickr";

import "jquery";
import $ from "jquery";

import "urijs";
import URI from "urijs";

import * as rv from "./HTMLFormElement-HTMLInputElement.reportValidity";

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
    document.getElementById("product-css").href = css_path;
});

// URLの工務店IDパラメータを引き継ぐ
$(() => {
    const id_key = "c";
    const id_val = getUrlParam(id_key);

    document.getElementById("constructionShopId").value = id_val;
});

// URLのパラメータによって初回のフォームもしくは2回目以降のフォームにする
$(() => {
    const key = "user";
    const val = getUrlParam(key);
    if (val === "existing") {
    // 2回目以降の申込みフォーム
    // 初回のみ必須入力の項目を非表示にする
        const only_first_elems = $("*[name=only_first]");
        hideElement(only_first_elems);
        // 2回目以降は任意入力になる項目を設定する
        arbitrariseInput();
        // 2回目以降で表示するキャプションを設定
        $("#second_caption").css("display", "block");
    } else {
    // 初回申込みフォーム
    // 特に変更する必要はない
    }
});

// URLから指定したパラメータを取得する
function getUrlParam(param_name) {
    const uri = new URI(window.location);
    const params = uri.query(true);
    return params[param_name];
}

// 2回目以降申込みフォームで不要なコントロールの必須チェックを外してフォームから非表示にする
function hideElement(element) {
    cancelValidation(element);
    element.css("display", "none");
}

// 必須入力項目を任意入力に変更する
function arbitrariseInput() {
    $("div[name=arbitrary_second]").each(function() {
    // 必須のラベルを任意に変更
        $(this).find("span" + ".badge").removeClass("badge-danger");
        $(this).find("span" + ".badge").addClass("badge-secondary");
        $(this).find("span" + ".badge").html("任意");

        // ブランクのまま送信は許すが、入力するなら入力可能パターンはチェックする
        $(this).find("input").removeClass("no-blank");
        $(this).find("select").removeClass("no-blank");
        $(this).find("input").removeAttr("required");
        $(this).find("select").removeAttr("required");
    });
}

function cancelValidation(element) {
    element.find("input").removeClass("no-blank pattern-required");
    element.find("input").removeAttr("required");
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
        $(this).removeClass(
            "border border-danger"
        );
        $(this).addClass(
            "border border-success"
        );
        $(this).nextAll(".valid-input").css({
            "display": "block"
        });
        $(this).nextAll(".invalid-input").css({
            "display": "none"
        });
        $(this).nextAll(".invalid-feedback").css({
            "display": "none"
        });
    } else {
        $(this).removeClass(
            "border border-success"
        );
        $(this).addClass(
            "border border-danger"
        );
        $(this).nextAll(".valid-input").css({
            "display": "none"
        });
        $(this).nextAll(".invalid-input").css({
            "display": "block"
        });
        $(this).nextAll(".invalid-feedback").css({
            "display": "block"
        });
    }
}

function pattern_validate(obj, blank_allowed) {
    const pattern = new RegExp(obj.attr("pattern"));

    const input_is_valid = pattern.test(obj.val());
    const input_is_blank = (obj.val() == "");
    if (input_is_valid
        || (blank_allowed && input_is_blank)) {
        // 有効な入力
        obj.css({
            "border": "1px solid #28a745",
        });
        obj.nextAll(".valid-input").css({
            "display": "block",
        });
        obj.nextAll(".invalid-input").css({
            "display": "none",
        });
        obj.nextAll(".invalid-feedback").css({
            "display": "none",
        });
    } else {
        // 無効な入力
        obj.css({
            "border": "1px solid #dc3545",
        });
        obj.nextAll(".valid-input").css({
            "display": "none",
        });
        obj.nextAll(".invalid-input").css({
            "display": "block",
        });
        obj.nextAll(".invalid-feedback").css({
            "display": "block",
        });
    }
}

// ライブラリから銀行情報を入力したときに正しくバリデーションがかからないので、預金種目をクリックした時にチェックする
$(() => {
    $("input[name=deposit_Form]").on("click", () => {
        $("input[name=bankCode_Form]").addClass("pattern-required");
        $("input[name=bankName_Form]").addClass("no-blank");
        $("input[name=branchCode_Form]").addClass("pattern-required");
        $("input[name=branchName_Form]").addClass("no-blank");
        $("input[name=bankCode_Form]").blur(function () {pattern_validate($(this));});
        $("input[name=bankCode_Form]").blur();
        $("input[name=bankName_Form]").blur(blank_validate);
        $("input[name=bankName_Form]").blur();
        $("input[name=branchCode_Form]").blur(function () {pattern_validate($(this));});
        $("input[name=branchCode_Form]").blur();
        $("input[name=branchName_Form]").blur(blank_validate);
        $("input[name=branchName_Form]").blur();
    });
});

$(() => {
    $(".bank-info").blur(function() {
        const pattern = new RegExp($(this).attr("pattern"));
        if (pattern.test($(this).val())) {
            $(this).css({
                "border": "1px solid #28a745",
            });
            $(this).nextAll(".valid-input").css({
                "display": "block",
            });
            $(this).nextAll(".invalid-input").css({
                "display": "none",
            });
            $(this).nextAll(".invalid-feedback").css({
                "display": "none",
            });
        } else {
            $(this).css({
                "border": "1px solid #dc3545",
            });
            $(this).nextAll(".valid-input").css({
                "display": "none",
            });
            $(this).nextAll(".invalid-input").css({
                "display": "block",
            });
            $(this).nextAll(".invalid-feedback").css({
                "display": "block",
            });
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
            $("#report-validity").css({display: "inline"});
            return;
        }

        $("#report-validity").css({display: "none"});


        const form_data = new FormData($("#form_id")[0]);

        // 添付ファイルが空の場合は要素を削除。削除しないとSafariで不具合が出る
        $("input[type=file]").each((i, j) => {
            const name = $(j).attr("name");
            if(!$(`[name=${  name  }]`).val()) {
                form_data.delete(name);
            }
        });

        // 多重送信防止
        $("#send").html("送信中...");
        $("#send").prop("disabled", true);

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
                $("#send").html("送信");
                $("#send").prop("disabled", false);
                window.location.href = String(data["redirect"]);
            })
            .fail((data) => {
                // 失敗時はアラートを出すだけ。ページ遷移しない。フォームの入力内容もそのまま
                console.error(JSON.stringify(data));
                $("#send").html("送信");
                $("#send").prop("disabled", false);
                alert(`登録に失敗しました。\n${data.responseJSON.message}`);
            });
    });
});
