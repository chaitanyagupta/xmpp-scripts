var net = require('net');
var xmpp = require('../../js/node-xmpp/lib/node-xmpp');
var register = require('./register');
var roster = require('./roster');

var NS_CLIENT = 'jabber:client';
var NS_STREAM = 'http://etherx.jabber.org/streams';

var host;
var port;
var domain = 'cg-mac.example.com';

// exit callback

var exitCallback = function () {
    process.exit();
};

// register

var createClient = function (host, port, domain) {
    return new xmpp.RawClient({ host: host,
                                port: port,
                                domain: domain });
};

var startRegister = function (usernames) {
    var client = createClient(host, port, domain);
    client.on('error', function (e) {
        console.error('got client error: ' + e);
    });
    register.register(client, usernames, exitCallback);
    client.connect();
};

// roster

var startRosterAdd = function (user, contacts) {
    var client = new roster.RosterClient({ jid: 'user2@cg-mac.example.com',
                                           password: 'user2' });
    client.add('user11@cg-mac.example.com');
};

var start = function () {
    console.assert(domain, "'domain' not provided");
    if (!host || !port) {
        host = domain;
        port = 5222;
    }
    var command = process.argv[2];
    var args = process.argv.slice(3);
    switch (command) {
        case 'register': startRegister(args); break;
        case 'roster': startRosterAdd(args[0], args.slice(1)); break;
        default: console.log('Usage: node main.js command args...'); break;
    }
};

start();

