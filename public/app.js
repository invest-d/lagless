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
            "cost": "3.85%",
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
                    "closing": "2019-09-20",
                    "deadline": "2019-09-22",
                    "early": "2019-09-30"
                },
                {
                    "closing": "2019-10-20",
                    "deadline": "2019-10-22",
                    "early": "2019-10-31"
                },
                {
                    "closing": "2019-11-20",
                    "deadline": "2019-11-22",
                    "early": "2019-11-30"
                },
                {
                    "closing": "2019-12-20",
                    "deadline": "2019-12-22",
                    "early": "2019-12-31"
                }
            ]
        }, param);
        $('#content').show();
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
    
    $('.cost').text(client.cost);
    $('.limit').text(client.limit);
    $('.cond-'+mode).show();
    $('.form_1').attr('href', client.form_1);
    $('.form_2').attr('href', client.form_2);
    $('.link').attr('href', client.link);
    $('.mail').text(client.mail).attr('href', 'mailto:'+client.mail);
    
    $('.closing').text(client.closing);
    $('.deadline').text(client.deadline);
    $('.early').text(client.early);
    $('.original').text(client.original);
    $('.closing').text(client.closing);
    $('.lag').text(client.lag);
    $('.effect').text(client.effect);

    var now = new Date();
    var schedule = client.schedule.find(function(s) {
        return now.getTime() <= (new Date(s.deadline)).getTime();
    });
    if(schedule) {
        $('.schedule_closing').text(format_date(schedule.closing));
        $('.schedule_early').text(format_date(schedule.early));
        $('.schedule_deadline').text(format_date(schedule.deadline));
    }
    
    if(param.f) {
        $('.first').show();
    }
};
