Introduction
============

xmpp-scripts is a set of scripts written in node.js to generate a
large number of users for a local openfire installation, or to add (or
remove) them to a single user's roster, or to take them online en
masse (the idea is to test roster performance of an XMPP client in a
controlled environment).

Basic usage goes like this:

    # Create user1 and user2 on an XMPP server
    $ node main.js register user1 user2

    # Add user2 and user3 to user1's roster and vice-versa
    $ node main.js roster-add user1 user2 user3

    # Remove user2 and user3 from user1's roster and vice-versa
    $ node main.js roster-remove user1 user2 user3

    # Take user1 and user2 online
    $ node main.js go-online user1 user2

Installation
============

Ensure that [node-xmpp](https://github.com/astro/node-xmpp) and all
its dependencies are installed:

    $ npm install node-xmpp -g

Clone xmpp-scripts and update submodules (this clones a
[fork](http://github.com/chaitanyagupta/node-xmpp) of node-xmpp):

    $ git clone git://github.com/chaitanyagupta/xmpp-scripts.git
    $ git submodule init
    $ git submodule update

Create a file called `conf.js` and fill your run-time parameters
(server details) accordingly:

     exports.host = '127.0.0.1';
     exports.port = 5222;
     exports.domain = 'cg-mac.example.com';

Usage
=====

See usage examples in the introduction.

To generate a large number of usernames, one can use a script like
`gen-usernames` (included in the repository):

    $ ./gen-usernames user 1 7
    user1
    user2
    user3
    user4
    user5
    user6
    user7

The output of `gen-usernames` can be used to pass arguments to the
main script:

    $ node main.js register `./gen-usernames user 1 7`

Notes
=====

`register` should work with any XMPP server which supports in-band
registration
([XEP-0077](http://xmpp.org/extensions/xep-0077.html)). Other actions
should just work with any XMPP server.

However, the code is not tested much, and it has only been tested
with Openfire.

In other news, event-driven programming (read: node.js) sucks for
scripting.
