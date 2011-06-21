var net = require('net');
var xmpp = require('node-xmpp');
var xml = xmpp.XML;
var utils = require('./utils');
var RawClient = require('./raw-client');
var register = require('./register');
var roster = require('./roster');
var conf = require('./conf');

var NS_CLIENT = 'jabber:client';
var NS_STREAM = 'http://etherx.jabber.org/streams';

var host = conf.host;
var port = conf.port;
var domain = conf.domain;

// exit callback

var exitCallback = function () {
    console.log('Exiting...');
    process.exit();
};

// register

var createClient = function (host, port, domain) {
    return new RawClient.RawClient({ host: host,
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

// roster add

var startAcceptSubscription = function (username, callback) {
    console.log('Accepting subscriptions for: ' + username);
    var client = new xmpp.Client({ host: host,
                                   port: port,
                                   jid: username + '@' + domain,
                                   password: username });
    var closeTimeout;
    client.on('error', function (e) {
        console.error('Got error: ' + e);
    });
    client.on('online', function () {
        client.send(new xml.Presence());
        closeTimeout = setTimeout(function () { client.end(); }, 2000);
    });
    client.on('stanza', function (stanza) {
        if (stanza.type === 'subscribe') {
            client.send(new xml.Presence({ to: stanza.from, type: 'subscribed' }));
            // In an ideal world, we should check if we are already
            // subscribed to the contact or not
            client.send(new xml.Presence({ to: stanza.from, type: 'subscribe' }));
        }
    });
    client.on('close', function () {
        clearTimeout(closeTimeout);
        callback();
    });
};

var startRosterAdd = function (username, contacts) {
    // first step is to add all the contacts to our user's roster
    var client = new roster.RosterClient({ host: host,
                                           port: port,
                                           jid: username + '@' + domain,
                                           password: username });
    for (var i in contacts) {
        client.add(contacts[i]);
    }
    client.once('stanza', function () {
        console.log('Closing XMPP connection');
        client.end();
    });
    client.on('close', function () {
        // next step is to accept our user's subscription request from all
        // the contacts
        var remaining = contacts.length;
        for (var i in contacts) {
            startAcceptSubscription(contacts[i], function () {
                --remaining;
                if (remaining === 0) {
                    startAcceptSubscription(username, function () {
                        exitCallback();
                    });
                }
            });
        }
    });
};

// roster remove

var startRosterRemove = function (username, contacts) {
    var client = new roster.RosterClient({ host: host,
                                           port: port,
                                           jid: username + '@' + domain,
                                           password: username });
    for (var i in contacts) {
        client.remove(contacts[i]);
    }
    client.on('stanza', function (stanza) {
        console.log('Received: ' + stanza);
    });
    client.once('stanza', function () {
        console.log('Closing XMPP connection');
        client.end();
    });
};

// just go online

var goOnline = function (username) {
    var client = new xmpp.Client({ host: host,
                                   port: port,
                                   jid: username + '@' + domain,
                                   password: username });
    client.on('online', function () {
        client.send(new xml.Presence());
    });
}

var startOnline = function (usernames) {
    for (var i in usernames) {
        goOnline(usernames[i]);
    }
}

// program entry

var main = function () {
    console.assert(domain, "'domain' not provided");
    if (!host || !port) {
        host = domain;
        port = 5222;
    }
    var command = process.argv[2];
    var args = process.argv.slice(3);
    switch (command) {
        case 'register': startRegister(args); break;
        case 'roster-add': startRosterAdd(args[0], args.slice(1)); break;
        case 'roster-remove': startRosterRemove(args[0], args.slice(1)); break;
        case 'go-online': startOnline(args); break;
        default: console.log('Usage: node main.js command args...'); break;
    }
};

main();
