var fs        = require('fs');
var express   = require('express');
var barrister = require('barrister');

// Define some constants for our error codes
var ERR_INVALID = 100;
var ERR_DENIED  = 101;
var ERR_LIMIT   = 102;

// Our implementation of the ContactService interface in "contact.idl"
function ContactService() { 
    this.contacts = {};
}

// Notice that we always add a "callback" param as the last arg to all
// functions.  The other params should match the IDL function signature.
ContactService.prototype.put = function(contact, callback) {
    var me = this;
    var contactId = contact.contactId;

    // try to load existing contact using get()
    // this will also check to make sure the userId matches
    me.get(contactId, contact.userId, function(err, existingContact) {
        if (err) {
            callback(err);
        }
        else if (existingContact) {
            // old contact - update it and return success
            me.contacts[contactId] = contact;
            callback(null, contactId);
        }
        else {
            // new contact.  check if user is over their limit
            me.getAll(contact.userId, function(err, userContacts) {
                if (err) {
                    // propegate error from getAll()
                    callback(err);
                }
                else if (userContacts.length >= 10) {
                    // send back an error - user over limit
                    var msg = "User " + contact.userId + " is at the 10 contact limit";
                    callback({code: ERR_LIMIT, message: msg }, null);
                }
                else {
                    // user is under limit - success
                    me.contacts[contactId] = contact;
                    callback(null, contactId);
                }
            });
        }
    });
};

ContactService.prototype.get = function(contactId, userId, callback) {
    // check if contact exists with this id
    if (this.contacts[contactId]) {
        var c = this.contacts[contactId];

        // check if userId owns this contact
        if (c.userId !== userId) {
            // Nope - return an error
            var msg = "userId " + userId + " doesn't own contact";
            callback({code: ERR_DENIED, message: msg}, null);
        }
        else {
            // Yes - return the contact
            callback(null, c);
        }
    }
    else {
        // nope, return null.  note that null returns
        // are only allowed by Barrister if the return type is
        // marked [optional] in the IDL, which it is for get()
        callback(null, null);
    }
};

ContactService.prototype.getAll = function(userId, callback) {
    var arr = [];
    var id;

    // return list of contacts owned by this userId
    for (id in this.contacts) {
        if (this.contacts.hasOwnProperty(id) && this.contacts[id].userId === userId) {
            arr.push(this.contacts[id]);
        }
    }

    // remember first arg to callback is always the error
    callback(null, arr);
};

// delete is a reserved word in JS, so we'll use bracket notation
// .delete() will also work, but jshint/lint will squawk
ContactService.prototype['delete'] = function(contactId, userId, callback) {
    var me = this;

    // get() the contact first, which will enforce
    // the userId ownership rule
    me.get(contactId, userId, function(err, contact) {
        if (err) {
            callback(err);
        }
        else {
            var deleted = false;
            if (contact) {
                // contact exists, remove from map
                delete me.contacts[contactId];
                deleted = true;
            }

            // success - return whether or not we deleted contact
            callback(null, deleted);
        }
    });
};

////////////////////////////////////////////
// main //
//////////

var idlFile = "../contact.json";

// load idlFile and parse as json
var idl = JSON.parse(fs.readFileSync(idlFile).toString());

// create a Server object for the given IDL
var server = new barrister.Server(idl);

// register our ContactService implementation with the server
// first arg is the interface name as a string
// second arg is the object that implements the interface
server.addHandler("ContactService", new ContactService());

// allow 1MB max per request
var MAX_POST = 1024*1024;

// utility function to read request body and enforce
// our MAX_POST limit
function readRequest(req, res, callback) {
    var body = '';
    req.on('data', function(chunk) {
        if (body.length > MAX_POST) {
            res.send("Max POST size exceeded", 413);
            callback(null);
        }
        else {
            body += chunk;
        }
    });
    req.on('end', function() {
        callback(body);
    });    
}

// Create an Express app and bind a POST url for '/contact'
var app = express.createServer();
app.post('/contact', function(req, res){
    readRequest(req, res, function(body) {
        if (body) {
            // server.handleJSON() takes a JSON string, parses it,
            // executes the correct method, and JSON encodes the
            // result.  If internal errors occur, those are trapped
            // and returned as JSON-RPC errors, so that's why 
            // this function doesn't return an "error" on the callback
            // it should always give you a JSON string to return to the
            // client
            server.handleJSON(body, function(respJson) {
                res.contentType('application/json');
                res.send(respJson);
            });
        }
    });
});
app.listen(3000);
