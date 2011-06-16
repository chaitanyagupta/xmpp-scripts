var net = require('net');
var xmpp = require('../../js/node-xmpp/lib/node-xmpp');
var register = require('./register');

var NS_CLIENT = 'jabber:client';
var NS_STREAM = 'http://etherx.jabber.org/streams';

// start

var createClient = function (host, port, domain) {
    return new xmpp.RawClient({ host: host,
                                port: port,
                                domain: domain });
};

var start = function () {
    var client = createClient('127.0.0.1', 5222, 'cg-mac.example.com');
    client.on('error', function (e) {
        console.error('got client error: ' + e);
    });
    register.register(client, ['user24']);
    client.connect();
};

start();
