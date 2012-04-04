var fs        = require('fs');
var express   = require('express');
var barrister = require('barrister');

// Define some constants for our error codes
var ERR_INVALID = 100;
var ERR_DENIED  = 101;
var ERR_LIMIT   = 102;

function ContactService() { 
    this.contacts = {};
}

ContactService.prototype.put = function(contact, callback) {
    var me = this;
    var contactId = contact.contactId;
    if (!me.contacts[contactId]) {
        me.getAll(contact.userId, function(err, userContacts) {
            if (err) {
                callback(err);
            }
            else if (userContacts.length >= 10) {
                var msg = "User " + contact.userId + " is at the 10 contact limit";
                callback({code: ERR_LIMIT, message: msg }, null);
            }
            else {
                me.contacts[contactId] = contact;
                callback(null, contactId);
            }
        });
    }
    else {
        me.contacts[contactId] = contact;
        callback(null, contactId);
    }
};

ContactService.prototype.get = function(contactId, userId, callback) {
    if (this.contacts[contactId]) {
        var c = this.contacts[contactId];
        if (c.userId !== userId) {
            var msg = "userId " + userId + " doesn't own contact";
            callback({code: ERR_DENIED, message: msg}, null);
        }
        else {
            callback(null, c);
        }
    }
    else {
        callback(null, null);
    }
};

ContactService.prototype.getAll = function(userId, callback) {
    var arr = [];
    var id;
    for (id in this.contacts) {
        if (this.contacts.hasOwnProperty(id) && this.contacts[id].userId === userId) {
            arr.push(this.contacts[id]);
        }
    }

    callback(null, arr);
};

// delete is a reserved word in JS, so we'll use bracket notation
ContactService.prototype['delete'] = function(contactId, userId, callback) {
    var me = this;
    me.get(contactId, userId, function(err, contact) {
        if (err) {
            callback(err);
        }
        else {
            var deleted = false;
            if (contact) {
                delete me.contacts[contactId];
                deleted = true;
            }
            callback(null, deleted);
        }
    });
};

////////////////////////////////////////////

var idlFile = "../contact.json";
var server  = new barrister.Server(JSON.parse(fs.readFileSync(idlFile).toString()));
server.addHandler("ContactService", new ContactService());

var app = express.createServer();

// allow 1MB max per request
var MAX_POST = 1024*1024;

app.post('/contact', function(req, res){
    var body = '';
    req.on('data', function(chunk) {
        if (body.length > MAX_POST) {
            res.send("Max POST size exceeded", 413);
        }
        else {
            body += chunk;
        }
    });
    req.on('end', function() {
        server.handleJSON(body, function(respJson) {
            res.contentType('application/json');
            res.send(respJson);
        });
    });
});
app.listen(3000);
