$(() => {
    const query = location.search;
    const param = { };
    const pairs = query.replace(/^\?/, "").split(/&/);
    for(let i=0 ; i<pairs.length ; i++) {
        const kv = pairs[i].split(/=/, 2);
        param[kv[0]] = kv[1];
    }

    if(location.protocol == "file:") {
        show({
            "工務店正式名称": "ほげほげ工務店",
            "cost": "3.85%",
            "yield": "1%",
            "transfer_fee": "100円(税抜)",
            "original": "翌月末",
            "mail": "d-p@invest-d.com",
            "form_2": "https://form.run/@dandolipayment-1-2",
            "link": "https://www.dandoli-payment.com",
            "pattern": "",
            "form_1": "https://form.run/@dandolipayment-1-1",
            "closing": "20日",
            "lag": "40日",
            "service": "ラグレス",//"ダンドリペイメント",
            "effect": "30日",
            "limit": "なし",
            "id": "100",
            "deadline": "24日",
            "early": "当月末",
            "schedule": [
                {
                    "closing": "2019-11-20",
                    "deadline": "2019-11-22",
                    "late": "2020-01-31",
                    "early": "2019-11-30"
                },
                {
                    "closing": "2020-12-20",
                    "deadline": "2020-12-22",
                    "late": "2021-03-31",
                    "early": "2020-12-31"
                }
            ],
            "default_pay_date_list": [
                {
                    "closing_date": "2020-04-30",
                    "default_pay_date": "2020-05-25"
                },
                {
                    "closing_date": "2020-05-31",
                    "default_pay_date": "2020-06-25"
                },
                {
                    "closing_date": "2020-06-30",
                    "default_pay_date": "2020-07-24"
                },
                {
                    "closing_date": "2020-12-20",
                    "default_pay_date": "2021-01-15"
                }
            ],
        }, param);
        setTimeout(() => {
            $("#content").show();
        }, 500);
        return;
    }

    const target = "https://firebasestorage.googleapis.com/v0/b/lagless.appspot.com/o/data.json?alt=media";
    $.ajax({
        url: target
    }).then((resp) => {
        if(resp[param.c]) {
            show(resp[param.c], param);
            $("#content").show();
        } else {
            $("#error").text("不正なパラメータです.").show();
        }
    });
});

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
    $(`.cond-${mode}`).show();
    $(".form_1").attr("href", `./apply.html?user=new&c=${param.c}&product=${mode}`);
    $(".form_2").attr("href", `./apply.html?user=existing&c=${param.c}&product=${mode}`);
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
