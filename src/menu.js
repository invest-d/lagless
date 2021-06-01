import "@fortawesome/fontawesome-free/js/solid";

import $ from "jquery";

import "url-search-params-polyfill";
const params = new URLSearchParams(window.location.search);

import * as app from "./app";

$(async () => {
    const data = await app.getConstructorData(params.get("c"));
    if (Object.keys(data).length === 0) {
        $("#error").text("不正なパラメータです.").show();
        return;
    }

    app.show(data, params);
    $("#content").show();

    displayByParameter();

    $(".skip_button").on("click", select_skip);
    $(".early_button").on("click", select_early);
    $(".late_button").on("click", select_late);
    $(".confirm_button").on("click", select_confirm);
    $(".back_button").on("click", back_to_top);

    //page topボタンの設定
    const topBtn = $("#pageTop");
    topBtn.hide();
    $(window).scroll(function(){
        if($(this).scrollTop() > 80){
            // 画面を80pxスクロールしたら、ボタンを表示する
            topBtn.fadeIn();
        }else{
            // 画面が80pxより上なら、ボタンを表示しない
            topBtn.fadeOut();
        }
    });
    // ボタンをクリックしたら、スクロールして上に戻る
    topBtn.click(() => {
        $("body,html").animate({
            scrollTop: 0}, 500);
        return false;
    });
});

function displayByParameter() {
    // URLパラメータ"d"によって、開いたときの画面を変更する
    const display = params.get("d");

    switch (display) {
    case "menu":
        // htmlメールから開いたとき→3種のボタンを押したときの画面を既に開く
        back_to_top();
        break;
    case "skip":
        // htmlメール以外から開いたとき→3種のボタンの画面を表示
        select_skip();
        break;
    case "early":
        select_early();
        break;
    case "late":
        select_late();
        break;
    default:
        // 3種ボタンの画面を表示する
        back_to_top();
    }
}

const hidable_divisions = [
    "#menu",
    "#confirm",
    "#skip_confirmed",
    "#early",
    "#late"
];

const select_skip = () => {
    show_division("#confirm");
};

const select_confirm = () => {
    show_division("#skip_confirmed");
};

const select_early = () => {
    show_division("#early");
};

const select_late = () => {
    show_division("#late");
};

const back_to_top = () => {
    show_division("#menu");
};

const show_division = (target) => {
    for (const division of hidable_divisions) {
        $(division).addClass("d-none");
    }
    $(target).removeClass("d-none");
};
