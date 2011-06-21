var sys = require('sys');
var xmpp = require('node-xmpp');
var Connection = xmpp.Connection;

var NS_CLIENT = 'jabber:client';
var NS_STREAM = 'http://etherx.jabber.org/streams';

function RawClient(params) {
    var self = this;
    Connection.Connection.call(self);
    self.host = params.host || '127.0.0.1';
    self.port = params.port || 5222;
    self.domain = params.domain || self.host;
    self.xmlns[''] = NS_CLIENT;
    self.xmppVersion = '1.0';
    self.streamTo = self.domain;
    self.socket.on('connect', function () {
        self.startParser();
        self.startStream();
    });
    self.on('error', function (e) {
        self.emit('error', e);
    });
    self.on('rawStanza', function (stanza) {
        self.emit('stanza', stanza);
        if (stanza.is('features', NS_STREAM)) {
            self.features = stanza;
            self.emit('features', stanza);
        } else if (stanza.is('iq', NS_CLIENT)) {
            self.emit('iq', stanza);
        } else if (stanza.is('presence', NS_CLIENT)) {
            self.emit('presence', stanza);
        } else if (stanza.is('message', NS_CLIENT)) {
            self.emit('message', stanza);
        }
    });
};

sys.inherits(RawClient, Connection.Connection);

RawClient.prototype.connect = function () {
    this.socket.connect(this.port, this.host);
};

exports.RawClient = RawClient;
