import "@fortawesome/fontawesome-free";

import "bootstrap";

import flatpickr from "flatpickr";
import "flatpickr/dist/l10n/ja.js";

import $ from "jquery";

import "url-search-params-polyfill";
const params = new URLSearchParams(window.location.search);

import * as rv from "./HTMLFormElement-HTMLInputElement.reportValidity";
import * as find from "./defineFindPolyfill";
find.definePolyfill();
import "formdata-polyfill";

import { get_kintone_data } from "./app";

// URLパラメータを引き継いでkintoneに送信できるようにする
$(() => {
    // 工務店ID
    const construction_shop_id = params.get("c");
    $("#constructionShopId").val(construction_shop_id);

    // 商品ロゴ
    const product_name = params.get("product");
    const logo_productname = ((product_name) => {
        if (product_name) {
            return product_name;
        } else {
            return "lagless";
        }
    })(product_name);
    // 早払いと遅払いで使うロゴを変更する
    const timing = getPaymentTiming();
    const version = ((timing) => {
        if (timing === "late") {
            return "v2";
        } else {
            return "v1";
        }
    })(timing);
    $("#header-logo").addClass(`${logo_productname}-${version}-logo`);

    // 支払いタイミング
    $("#paymentTiming").val(timing);
});

// URLのパラメータによって初回のフォームの見た目を変更する
$(() => {
    const key = "user";
    const val = params.get(key);
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

    if (getPaymentTiming() === "late") {
        $("span.timing").text("遅払い");
    } else {
        $("span.timing").text("早払い");
    }
});

// URLのcパラメータによって利用規約へのリンクを変更する
$(async () => {
    const resp = await get_kintone_data();
    const constructor_id = params.get("c");

    // どこかで必要な情報が足りなかった場合でも、terms-3の方にリンクさせる
    let url = "https://www.lag-less.com/terms-3";
    if (constructor_id && (constructor_id in resp) && (resp[constructor_id]["支払元口座"] === "LAGLESS")) {
        url = "https://invest-design.wixsite.com/lag-less/terms";
    }

    $("#terms").attr("onclick", `window.open('${url}', '_blank')`);
});

function getPaymentTiming() {
    const timing = params.get("t");
    if (timing === "late") {
        return "late";
    } else {
        // パラメータ無しの場合も早払いとする
        return "early";
    }
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
        pattern_validate($(this), params.get("user") === "existing");
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

const VALID_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png"
};

// 送信ボタンをクリックしたときの挙動
$(() => {
    $("#send").click(async function (event) {
    // formのデフォルトのsubmit挙動を止めて、独自にsubmit挙動を実装
        event.preventDefault();

        rv.defineReportValidityPolyfill();

        // ブランクチェックなど
        if(!this.form.reportValidity()) {
            $("#report-validity").show();
            return;
        }

        $("#report-validity").hide();

        // 各種添付ファイルチェック。添付ファイルを入力していない項目は無視する
        const inputs = $.makeArray($("input[type='file']").filter((i, elem) => $(elem).val() != ""));

        // Object.valuesはIEでは使えないので回避
        const extensions = Object.keys(VALID_MIME_TYPES).map((key) => VALID_MIME_TYPES[key]);
        // mimetypeをチェック
        const invalid_input = inputs.find((input) => {
            if (input.files[0].type) {
                return !(input.files[0].type in VALID_MIME_TYPES);
            } else {
                // IEでは、少なくともPDFファイルの場合に input.files[0].type が空文字となる。参考： https://stackoverflow.com/questions/32849014/ie-11-and-ie-edge-get-file-type-failed
                // 仕方ないのでファイル名を直接見る。
                // includes()もIEでは使えない
                return extensions.indexOf(input.files[0].name.split(".").slice(-1)[0]) === -1;
            }
        });
        if (invalid_input) {
            const valid_list = extensions.join(", ");
            const label_text = $(`label[for='${invalid_input.id}']`).text();
            alert(`${label_text}のファイル形式の変更をお願いします。\n`
                + `利用可能な形式は${valid_list}です。\n\n`
                + `現在のファイル形式：${$(invalid_input).val().split(".").slice(-1)[0]}`);
            return;
        }

        // 添付ファイルのファイルサイズが大きすぎるとサーバーエラーになるため、送信できないようにする。
        // functionsからkintoneに送信するリクエストボディの50MB制限に合わせる。36MB * 4/3 = 48MB
        const FILE_SIZE_LIMIT = 36 * Math.pow(1024, 2);
        const over_input = inputs.find((input) => input.files[0].size >= FILE_SIZE_LIMIT);
        if (over_input !== undefined) {
            // alertに表示するため、inputに対応するラベルを取得
            const label_text = $(`label[for='${over_input.id}']`).text();
            alert(`${label_text}のファイル容量を${FILE_SIZE_LIMIT / Math.pow(1024, 2)}MBより小さくしてください。\n`
            + `現在のファイル容量：およそ${(over_input.files[0].size / Math.pow(1024, 2)).toPrecision(2)}MB`);
            return;
        }

        const functions_post_data = new FormData($("#form_id")[0]);
        // 添付ファイルはFunctionsではなくStorageに送信するので、削除する
        $("input[type=file]").each((_, j) => {
            const name = $(j).attr("name");
            functions_post_data.delete(name);
        });

        // 多重送信防止
        showSending("送信中...");
        $("#send")
            .text("送信中...")
            .prop("disabled", true);

        try {
            let end_point = "https://us-central1-lagless.cloudfunctions.net";
            let env = "dev";
            if (location.hostname === "payment.invest-d.com") {
                end_point = `${end_point}/send_apply`;
                env = "prod";
            } else {
                end_point = `${end_point}/send_apply_dev`;
            }
            const uploaded_files = await upload_attachment_files(inputs, end_point, env);
            const result = await post_to_kintone(functions_post_data, uploaded_files, end_point);
            window.location.href = String(result.redirect);
        } catch (err) {
            alert(err.message);
            hideSending();
            $("#send")
                .text("送信")
                .prop("disabled", false);
        }
        // 成功すればそのままページ遷移するため、hideSending()は必要ない
    });
});

const upload_attachment_files = async (inputs, end_point, env) => {
    const get_signed_url = (file_name, mime_type, url) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                data: JSON.stringify({
                    process_type: "signed_url",
                    file_name: file_name,
                    mime_type: mime_type
                }),
                cache: false,
                processData: false,
                contentType: false,
            })
                .done((data) => resolve(data.signed_url))
                .fail((err) => reject(err));
        });
    };

    const upload_file = (signed_url, file) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                type : "PUT",
                url : signed_url,
                headers: {
                    "Content-Type": file.type
                },
                data : file,
                cache : false,
                processData: false,
            })
                .done(() => resolve())
                .fail((err) => reject(err));
        });
    };

    const timestamp = new Date().getTime();
    const upload_processes = inputs.map(async (input) => {
        const ext = VALID_MIME_TYPES[input.files[0].type];
        const field_name = input.attributes.name.value;
        // 同じファイル名だと上書きするので、タイムスタンプで上書きを回避
        const file_name = `${field_name}_${timestamp}${env}.${ext}`;

        // アップロードするファイルの数だけ、異なる署名付きURLが必要になる
        const signed_url = await get_signed_url(file_name, input.files[0].type, end_point);
        await upload_file(signed_url, input.files[0]);
        return {
            name: file_name,
            mime_type: input.files[0].type,
        };
    });

    return Promise.all(upload_processes)
        .then((files) => files)
        .catch((err) => {
            console.error(err);
            throw new Error("申込の送信中にエラーが発生しました。\n"
            + "ご不便をおかけして申し訳ございません。時間を置いて再度お試し頂くか、下記連絡先にお問い合わせください。\n\n"
            + `${$("#contact").text()}`);
        });
};

const post_to_kintone = async (form_data, files, end_point) => {
    return new Promise((resolve, reject) => {
        // json形式で送信する
        const input_data = {};
        for (const [key, val] of form_data) {
            input_data[key] = val;
        }

        $.ajax({
            type: "POST",
            url: end_point,
            dataType: "json",
            data: JSON.stringify({
                process_type: "post",
                fields: input_data,
                files: files,
            }),
            cache: false,
            processData: false,
            contentType: false
        })
            .done((data) => resolve(data))
            .fail((err) => {
                console.error(err);
                reject(new Error("申込の送信中にエラーが発生しました。\n"
                    + "ご不便をおかけして申し訳ございません。時間を置いて再度お試し頂くか、下記連絡先にお問い合わせください。\n\n"
                    + `${$("#contact").text()}`));
            });
    });
};

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
