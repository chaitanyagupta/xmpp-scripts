var net = require('net');
var xmpp = require('../../js/node-xmpp/lib/node-xmpp');
var register = require('./register');
var roster = require('./roster');

var NS_CLIENT = 'jabber:client';
var NS_STREAM = 'http://etherx.jabber.org/streams';

// start

var createClient = function (host, port, domain) {
    return new xmpp.RawClient({ host: host,
                                port: port,
                                domain: domain });
};

var startRegister = function () {
    var client = createClient('127.0.0.1', 5222, 'cg-mac.example.com');
    client.on('error', function (e) {
        console.error('got client error: ' + e);
    });
    register.register(client, arguments);
    client.connect();
};

var startRosterAdd = function () {
    var client = new roster.RosterClient({ jid: 'user2@cg-mac.example.com',
                                           password: 'user2' });
    client.add('user11@cg-mac.example.com');
};

var start = function () {
    var command = process.argv[2];
    var args = process.argv.slice(3);
    switch (command) {
        case 'register': startRegister.apply(null, args); break;
        case 'roster': startRosterAdd.apply(null, args); break;
        default: console.log('Usage: node main.js command args...'); break;
    }
};

start();

