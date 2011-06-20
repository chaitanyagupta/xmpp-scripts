var sys = require('sys');
var xmpp = require('../../js/node-xmpp/lib/node-xmpp');
var xml = xmpp.XML;
var utils = require('./utils');

var STATE_PREAUTH = 0,
    STATE_AUTH = 1,
    STATE_AUTHED = 2,
    STATE_BIND = 3,
    STATE_SESSION = 4,
    STATE_ONLINE = 5;

function RosterClient (attrs) {
    var self = this;
    xmpp.Client.call(self, attrs);
    self.on('online', function () {
        var rosterIq = new xml.Iq({ id: utils.getUID(), type: 'get' });
        rosterIq.c('query', { xmlns: 'jabber:iq:roster' });
        self.send(rosterIq);
        self.send(new xml.Presence());
        self.emit('visible');
    });
    self.on('stanza', function (stanza) {
        if (stanza.is('presence') && (stanza.type == 'subscribe')) {
            this.send(new xml.Presence({ to: stanza.from, type: 'subscribed' }));
        }
    });
}

sys.inherits(RosterClient, xmpp.Client);


RosterClient.prototype.send = function(stanza) {
    console.log('sending from raw client: ' + stanza);
    RosterClient.super_.prototype.send.call(this, stanza);
};


RosterClient.prototype.add = function (username) {
    var self = this;
    if (self.state != STATE_ONLINE) {
        self.once('online', function () {
            self.add(username);
        });
        return;
    }

    console.log('roster: subscribing to ' + username);
    var jid = username + '@' + self.jid.domain;
    this.send(new xml.Presence({ to: jid, type: 'subscribe' }));
};

RosterClient.prototype.remove = function (username) {
    var self = this;
    if (self.state != STATE_ONLINE) {
        self.once('online', function () {
            self.remove(username);
        });
        return;
    }

    console.log('roster: removing ' + username);
    var jid = username + '@' + self.jid.domain;
    var iq = new xml.Iq({id: utils.getUID(), type: 'set'});
    var query = new xml.Element('query', { xmlns: 'jabber:iq:roster' });
    query.c('item', { jid: jid, subscription: 'remove' });
    iq.cnode(query);
    self.send(iq);
};

exports.RosterClient = RosterClient;
