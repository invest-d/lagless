$(function() {
    var query = location.search;
    var param = { };
    var pairs = query.replace(/^\?/, '').split(/&/);
    for(var i=0 ; i<pairs.length ; i++) {
        var kv = pairs[i].split(/=/, 2);
        param[kv[0]] = kv[1];
    }

    if(location.protocol == 'file:') {
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
        setTimeout(function() {
            $('#content').show();
        }, 500);
        return;
    }

    var target = "https://firebasestorage.googleapis.com/v0/b/lagless.appspot.com/o/data.json?alt=media";
    $.ajax({
        url: target
    }).then(function(resp) {
        if(resp[param.c]) {
            show(resp[param.c], param);
            $('#content').show();
        } else {
            $('#error').text('不正なパラメータです.').show();
        }
    });
});

var format_date = function(str) {
    var t = new Date(str);
    var wod = [ '日', '月', '火', '水', '木', '金', '土' ];
    return t.getFullYear()+'年'+(t.getMonth()+1)+'月'+t.getDate()+'日 ('+wod[t.getDay()]+')';
};

var show = function(client, param) {
    $('.service').text(client.service);
    var mode = { 'ラグレス': 'lagless', 'ダンドリペイメント': 'dandori', 'リノベ不動産Payment': 'renove' }[client.service];

    $('.工務店正式名称').text(client.工務店正式名称);
    $('.cost').text(client.cost);
    $('.yield').text(client.yield);
    $('.transfer_fee').text(client.transfer_fee);
    $('.limit').text(client.limit);
    $('.cond-'+mode).show();
    // 特定の工務店IDだけは工務店マスタ記載のフォームを使用
    if (["101", "104"].includes(param.c)) {
        $('.form_1').attr('href', client.form_1);
        $('.form_2').attr('href', client.form_2);
    } else {
        $('.form_1').attr('href', `./apply?user=new&c=${param.c}&product=${mode}`);
        $('.form_2').attr('href', `./apply?user=existing&c=${param.c}&product=${mode}`);
    }
    if(client.link) {
        $('.link').attr('href', client.link).text(client.link);
        $('.link').parents('div').show();
    }
    $('.mail').text(client.mail).attr('href', 'mailto:'+client.mail);

    $('.closing').text(client.closing);
    $('.deadline').text(client.deadline);
    $('.early').text(client.early);
    $('.original').text(client.original);
    $('.closing').text(client.closing);
    $('.lag').text(client.lag);
    $('.effect').text(client.effect);

    var now = new Date();
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var schedule = client.schedule.find(function(s) {
        var ymd = s.deadline.split(/\D/);
        var t = new Date(ymd[0], parseInt(ymd[1])-1, ymd[2]);
        return now.getTime() <= t.getTime();
    });
    if(schedule) {
        $('.schedule_closing').text(format_date(schedule.closing));
        $('.schedule_early').text(format_date(schedule.early));
        $('.schedule_deadline').text(format_date(schedule.deadline));
        $('.schedule_late').text(format_date(schedule.late));

        client.default_pay_date_list.find(function(pair) {
            if(pair.closing_date == schedule.closing) {
                $('.schedule_default').text(format_date(pair.default_pay_date));
                return true;
            } else {
                return false;
            }
        });
    }

    if(param.f) {
        $('.first').show();
    }
};
