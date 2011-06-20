var xmpp = require('node-xmpp');
var xml = xmpp.XML;
var utils = require('./utils');

/*
SEND:
<iq type='get' id='purple8f08d3bf'><query xmlns='jabber:iq:register'/></iq>

RECV:
<iq type="result" id="purple8f08d3bf">
  <query xmlns="jabber:iq:register">
    <username />
    <password />
    <email />
    <name />
    <x xmlns="jabber:x:data" type="form">
      <title>XMPP Client Registration</title>
      <instructions>Please provide the following
      information</instructions>
      <field var="FORM_TYPE" type="hidden">
        <value>jabber:iq:register</value>
      </field>
      <field label="Username" var="username" type="text-single">
        <required />
      </field>
      <field label="Full name" var="name" type="text-single" />
      <field label="Email" var="email" type="text-single" />
      <field label="Password" var="password" type="text-private">
        <required />
      </field>
    </x>
  </query>
</iq>

SEND:
<iq type='set' id='purple8f08d3c0'>
  <query xmlns='jabber:iq:register'>
    <username>test-user</username>
    <password>test-user</password>
    <name>test-user</name>
    <email>test-user@cg-mac.example.com</email>
  </query>
</iq>

RECV:
<iq type="result" id="purple8f08d3c0" to="cgs-laptop.example.com/98e6a657"/>

*/

var createField = function (name, value) {
    var field = new xml.Element(name);
    field.t(value);
    return field;
};

var createUser = function (client, username, password, name, callback, errback) {
    var iq = new xml.Iq({
        id: utils.getUID(),
        type: 'set'
    });

    var query = new xml.Element('query', {
        xmlns: 'jabber:iq:register'
    });

    query.cnode(createField('username', username));
    query.cnode(createField('password', password));
    query.cnode(createField('name', name || 'Default'));
    query.cnode(createField('email', username + '@' + client.domain));

    iq.cnode(query);

    client.on('iq', function (stanza) {
        if (stanza.id == iq.id) {
            client.removeListener('iq', arguments.callee);
            if (stanza.type == 'result') {
                callback(username);
            } else {
                errback(stanza.getChild('error').toString(), username);
            }
        }
    });
    client.send(iq);
};

var register = function (client, usernames, doneCallback) {
    var remaining = usernames.length;
    client.on('features', function (features) {
        var callback = function (username) {
            console.log('register: ' + username + ' created successfully');
            --remaining;
            if (remaining === 0) { doneCallback(); }
        };
        var errback = function (e, username) {
            console.log('register: error registering ' + username + ': ' + e);
            --remaining;
            if (remaining === 0) { doneCallback(); }
        };
        var registerUser = function (username) {
            createUser(client, username, username, username, callback, errback);
        };
        for (var i in usernames) {
            registerUser(usernames[i]);
        }
    });
};

exports.register = register;
