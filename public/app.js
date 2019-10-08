var clients = [
    { id: 100, pattern: '20-31-1', service: 'ダンドリペイメント', cost: '3.85%', limit: '' },
    { id: 204, pattern: '31-10-2', service: 'ラグレス', cost: '3.85%', limit: '4' }
];

$(function() {
    var query = location.search;
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
    $('.limit').text(client.limit || '無し');
});
