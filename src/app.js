import $ from "jquery";

import { defineIncludesPolyfill } from "./defineIncludesPolyfill";
defineIncludesPolyfill();

import "url-search-params-polyfill";
const params = new URLSearchParams(window.location.search);

$(() => {
    if(location.protocol == "file:") {
        show( {
            "cost": "9.99%",
            "yield": "1.11%",
            "mail": "hogehoge@invest-d.com",
            "link": "",
            "工務店正式名称": "株式会社サンプル工務店3",
            "transfer_fee": "275円（税込）",
            "service": "ラグレス",
            "limit": "なし",
            "default_pay_date_list": [
                {
                    "closing_date": "2020-07-25",
                    "default_pay_date": "2020-09-10"
                },
                {
                    "closing_date": "2020-08-25",
                    "default_pay_date": "2020-10-10"
                },
                {
                    "closing_date": "2020-09-25",
                    "default_pay_date": "2020-11-10"
                },
                {
                    "closing_date": "2020-10-25",
                    "default_pay_date": "2020-12-10"
                },
                {
                    "closing_date": "2020-11-25",
                    "default_pay_date": "2021-01-10"
                },
                {
                    "closing_date": "2020-12-25",
                    "default_pay_date": "2021-02-10"
                },
                {
                    "closing_date": "2021-01-25",
                    "default_pay_date": "2021-03-10"
                }
            ],
            "closing": "月末",
            "original": "翌月末",
            "lag": "35日",
            "deadline": "25日",
            "early": "当月末",
            "effect": "30日",
            "pattern": "25-10B",
            "schedule": [
                {
                    "pattern": "25-10B",
                    "closing": "2021-01-31",
                    "late": "2021-05-04",
                    "deadline": "2021-01-25",
                    "early": "2021-02-01"
                }
            ]
        }, params);
        setTimeout(() => {
            $("#content").show();
        }, 500);
        return;
    }

    get_kintone_data().then((resp) => {
        if(resp[params.get("c")]) {
            show(resp[params.get("c")], params);
            $("#content").show();
        } else {
            $("#error").text("不正なパラメータです.").show();
        }
    });
});

export const get_kintone_data = () => {
    const target = "https://firebasestorage.googleapis.com/v0/b/lagless.appspot.com/o/data.json?alt=media";
    return $.ajax({ url: target });
};

const format_date = function(str) {
    const t = new Date(str);
    const wod = [ "日", "月", "火", "水", "木", "金", "土" ];
    return `${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日 (${wod[t.getDay()]})`;
};

const show = function(client, params) {
    $(".service").text(client.service);
    const mode = { "ラグレス": "lagless", "ダンドリペイメント": "dandori", "リノベ不動産Payment": "renove" }[client.service];

    $(".工務店正式名称").text(client.工務店正式名称);
    $(".cost").text(client.cost);
    $(".yield").text(client.yield);
    $(".transfer_fee").text(client.transfer_fee);
    $(".limit").text(client.limit);
    if (client.limit.match(/0|なし/)) {
        $(".limit-precaution").text("");
    } else {
        $(".limit-precaution").text(`早払い年間利用回数制限${client.limit}。`);
    }
    $(`.cond-${mode}`).show();
    $(".form_1").attr("href", `./apply.html?user=new&c=${params.get("c")}&a=${params.get("a")}&product=${mode}`); // param.aはURLに表示するだけなのでundefinedでも問題ない
    $(".form_2").attr("href", `./apply.html?user=existing&c=${params.get("c")}&a=${params.get("a")}&product=${mode}`);
    // 遅払い用
    $(".form_3").attr("href", `./apply.html?user=new&c=${params.get("c")}&a=${params.get("a")}&product=${mode}&t=late`);
    $(".form_4").attr("href", `./apply.html?user=existing&c=${params.get("c")}&a=${params.get("a")}&product=${mode}&t=late`);
    if(client.link) {
        $(".link").attr("href", client.link).text(client.link);
        $(".link").parents("div").show();
    }
    $(".mail").text(client.mail).attr("href", `mailto:${client.mail}`);

    $(".closing").text(client.closing);
    $(".original").text(client.original);
    $(".lag").text(client.lag);
    $(".deadline").text(client.deadline);
    $(".early").text(client.early);
    $(".effect").text(client.effect);

    let now = new Date();
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const schedule = get_schedule(client.schedule, now);

    $("#schedule-closing-payment-same").hide();

    if(schedule) {
        $(".schedule_closing").text(format_date(schedule.closing));
        $(".schedule_early").text(format_date(schedule.early));
        $(".schedule_deadline").text(format_date(schedule.deadline));
        $(".schedule_late").text(format_date(schedule.late));

        // 締日と早期支払日が同じパターンか異なるパターンかによって表示を切り替える
        // closingプロパティとearlyプロパティを直接比較することはしない。本来のearlyの日付が休日のためにずれている場合などがある
        const closing_payment_same_patterns = [
            "31-31-N31-65"
        ];
        if (closing_payment_same_patterns.includes(schedule.pattern)) {
            $("#schedule-closing-payment-same").show();
            $("#schedule").hide();
        }

        client.default_pay_date_list.find((pair) => {
            if(pair.closing_date == schedule.closing) {
                $(".schedule_default").text(format_date(pair.default_pay_date));
                return true;
            } else {
                return false;
            }
        });
    }

    if(params.get("f")) {
        $(".first").show();
    }
};

export const get_schedule = (schedules, now) => {
    return schedules.find((s) => {
        const ymd = s.deadline.split(/\D/);
        const t = new Date(ymd[0], parseInt(ymd[1])-1, ymd[2]);
        return now.getTime() <= t.getTime();
    });
};
