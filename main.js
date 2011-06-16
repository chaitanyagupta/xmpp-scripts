var net = require('net');
var xmpp = require('../../js/node-xmpp/lib/node-xmpp');
var xml = xmpp.XML;

var NS_CLIENT = 'jabber:client';
var NS_STREAM = 'http://etherx.jabber.org/streams';

// utils
var i = 0;
var getUID = function () {
    return 'RawClient_' + i++;
};

// Client object and handling
var client;

var createClient = function (host, port, domain) {
    return new xmpp.RawClient({ host: host,
                                port: port,
                                domain: domain });
};

// register a user

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
    <x xmlns='jabber:x:data' type='submit'>
      <field var='FORM_TYPE'><value>jabber:iq:register</value></field>
      <field var='username'><value>user4</value></field>
      <field var='name'><value>4th User</value></field>
      <field var='email'><value>user4@cgs-laptop.example.com</value></field>
      <field var='password'><value>user4</value></field>
    </x>
  </query>
</iq>

RECV:
<iq type="result" id="purple8f08d3c0" to="cgs-laptop.example.com/98e6a657"/>

*/

var getField = function (varname, value) {
    var field = new xml.Element('field', {
        var: varname
    });
    field.children.push(new xml.Element('value').t(value));
    return field;
};

var createUser = function (username, password, name) {
    var iq = new xml.Iq({
        id: getUID(),
        type: 'set'
    });

    var query = new xml.Element('query', {
        xmlns: 'jabber:iq:register'
    });

    var x = new xml.Element('x', {
        xmlns: 'jabber:x:data',
        type: 'submit'
    });
    x.cnode(getField('username', username));
    x.cnode(getField('password', password));
    x.cnode(getField('name', name || 'Default'));

    query.cnode(x);

    iq.cnode(query);

    client.on('iq', function (stanza) {
        if (stanza.id == iq.id) {
            client.removeListener('iq', arguments.callee);
            if (stanza.type == 'result') {
                console.log('register: user ' + username + ' created successfully');
            }
        }
    });
    client.send(iq);
};

var register = function (username, password, name) {
    var iq = new xml.Iq({
        type: 'get',
        id: getUID()
    });
    var query = new xml.Element('query', {
        xmlns: 'jabber:iq:register'
    });
    iq.cnode(query);

    client.on('iq', function (stanza) {
        if (stanza.id == iq.id) {
            client.removeListener('iq', arguments.callee);
            if (stanza.type == 'result') {
                createUser(username, password, name);
            }
        }
    });

    client.send(iq);
};

// start
client = createClient('127.0.0.1', 5222, 'cg-mac.example.com');
client.on('features', function (features) {
    var registerUser = function (username) {
        register(username, username, username);
    };
    registerUser('user19');
    registerUser('user20');
});
client.connect();
