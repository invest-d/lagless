import $ from "jquery";

import { defineIncludesPolyfill } from "./defineIncludesPolyfill";
defineIncludesPolyfill();

$(() => {
    const query = location.search;
    const param = { };
    const pairs = query.replace(/^\?/, "").split(/&/);
    for(let i=0 ; i<pairs.length ; i++) {
        const kv = pairs[i].split(/=/, 2);
        param[kv[0]] = kv[1];
    }

    if(location.protocol == "file:") {
        show( {
            "cost": "9.99%",
            "yield": "1.11%",
            "original": "翌々月10日",
            "mail": "hogehoge@invest-d.com",
            "link": "",
            "pattern": "25-10B",
            "工務店正式名称": "株式会社サンプル工務店3",
            "closing": "25日",
            "lag": "45日",
            "transfer_fee": "275円（税込）",
            "service": "ラグレス",
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
            "effect": "30日",
            "limit": "なし",
            "deadline": "翌月3日",
            "early": "翌月10日",
            "schedule": [
                {
                    "closing": "2020-07-25",
                    "late": "2020-10-07",
                    "deadline": "2020-08-03",
                    "early": "2020-08-07"
                },
                {
                    "closing": "2020-08-25",
                    "late": "2020-11-07",
                    "deadline": "2020-09-03",
                    "early": "2020-09-10"
                },
                {
                    "closing": "2020-09-25",
                    "late": "2020-12-07",
                    "deadline": "2020-10-05",
                    "early": "2020-10-12"
                },
                {
                    "closing": "2020-10-25",
                    "late": "2021-01-07",
                    "deadline": "2020-11-03",
                    "early": "2020-11-10"
                },
                {
                    "closing": "2020-11-25",
                    "late": "2021-02-07",
                    "deadline": "2020-12-03",
                    "early": "2020-12-10"
                },
                {
                    "closing": "2020-12-25",
                    "late": "2021-03-07",
                    "deadline": "2021-01-04",
                    "early": "2021-01-12"
                }
            ]
        }, param);
        setTimeout(() => {
            $("#content").show();
        }, 500);
        return;
    }

    get_kintone_data().then((resp) => {
        if(resp[param.c]) {
            show(resp[param.c], param);
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

const show = function(client, param) {
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
    $(".form_1").attr("href", `./apply.html?user=new&c=${param.c}&a=${param.a}&product=${mode}`); // param.aはURLに表示するだけなのでundefinedでも問題ない
    $(".form_2").attr("href", `./apply.html?user=existing&c=${param.c}&a=${param.a}&product=${mode}`);
    // 遅払い用
    $(".form_3").attr("href", `./apply.html?user=new&c=${param.c}&a=${param.a}&product=${mode}&t=late`);
    $(".form_4").attr("href", `./apply.html?user=existing&c=${param.c}&a=${param.a}&product=${mode}&t=late`);
    if(client.link) {
        $(".link").attr("href", client.link).text(client.link);
        $(".link").parents("div").show();
    }
    $(".mail").text(client.mail).attr("href", `mailto:${client.mail}`);

    $(".closing").text(client.closing);
    $(".deadline").text(client.deadline);
    $(".early").text(client.early);
    $(".original").text(client.original);
    $(".closing").text(client.closing);
    $(".lag").text(client.lag);
    $(".effect").text(client.effect);

    let now = new Date();
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const schedule = client.schedule.find((s) => {
        const ymd = s.deadline.split(/\D/);
        const t = new Date(ymd[0], parseInt(ymd[1])-1, ymd[2]);
        return now.getTime() <= t.getTime();
    });
    if(schedule) {
        $(".schedule_closing").text(format_date(schedule.closing));
        $(".schedule_early").text(format_date(schedule.early));
        $(".schedule_deadline").text(format_date(schedule.deadline));
        $(".schedule_late").text(format_date(schedule.late));

        client.default_pay_date_list.find((pair) => {
            if(pair.closing_date == schedule.closing) {
                $(".schedule_default").text(format_date(pair.default_pay_date));
                return true;
            } else {
                return false;
            }
        });
    }

    if(param.f) {
        $(".first").show();
    }
};
