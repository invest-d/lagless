var clients = [
    { id: 100, pattern: '20-31-1', mode: 'dandori', service: 'ダンドリペイメント', mail: 'd-p@invest-d.com', link: 'https://www.dandoli-payment.com', form_1: 'https://form.run/@dandolipayment-1-1', form_2: 'https://form.run/@dandolipayment-1-2', cost: '3.85%', limit: 'なし' },
    { id: 204, pattern: '31-10-2', mode: 'lagless', service: 'ラグレス', mail: 'lagless@invest-d.com', link: 'https://www.lag-less.com', form_1: 'https://form.run/@dandolipayment-1-1', form_2: 'https://form.run/@dandolipayment-1-2', cost: '3.85%', limit: '年4回まで' },
    { id: 300, pattern: '31-10-2', mode: 'renove', service: 'リノベ不動産Ｐａｙｍｅｎｔ', mail: 'lagless@invest-d.com', link: 'https://www.lag-less.com', form_1: 'https://form.run/@dandolipayment-1-1', form_2: 'https://form.run/@dandolipayment-1-2', cost: '3.85%', limit: '年4回まで' }
];

$(function() {
    var query = location.search;
    if(location.protocol == 'file:') { query = 'c=300' }
    var param = { };
    var pairs = query.replace(/^\?/, '').split(/&/);
    for(var i=0 ; i<pairs.length ; i++) {
        var kv = pairs[i].split(/=/, 2);
        param[kv[0]] = kv[1];
    }
    var client = clients.filter(function(c) { return c.id==param.c; })[0];
    if(!client) {
        $('#error').text('不正なパラメータです.').show();
        return;
    }

    $('.service').text(client.service);
    $('.pattern').text(client.pattern);
    $('.patterns').hide();
    $('.pattern-'+client.pattern).show();
    $('.cost').text(client.cost);
    $('.limit').text(client.limit);
    $('.cond-'+client.mode).show();
    $('.form_1').attr('href', client.form_1);
    $('.form_2').attr('href', client.form_2);
    $('.link').attr('href', client.link);
    $('.mail').text(client.mail).attr('href', 'mailto:'+client.mail);
});
