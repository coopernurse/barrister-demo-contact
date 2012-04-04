var step      = require('step');
var barrister = require('barrister');

var contactIdCounter = 0;

function newContact(o) {
    o.contactId = o.contactId || (contactIdCounter++).toString();
    o.userId    = o.userId    || "user1";
    o.firstName = o.firstName || "Bob";
    o.lastName  = o.lastName  || "Smith";
    o.email     = o.email     || "bob@example.com";
    o.phones    = o.phones    || [];
    
    return o;
}

function log(s) {
    console.log(s);
}

step(
    function initClient() {
        this.client = barrister.httpClient("http://localhost:3000/contact");
        this.client.enableTrace(log);
        this.client.loadContract(this);
    },
    function putOneContact(err) {
        if (err) { throw JSON.stringify(err); }

        this.contactService = this.client.proxy("ContactService");
        this.firstContact = newContact({});
        this.contactService.put(this.firstContact, this);
    },
    function putInvalidContact(err, contactId) {
        if (err) { throw JSON.stringify(err); }

        if (contactId !== this.firstContact.contactId) {
            throw "Didn't get contactId we expected: " + contactId;
        }

        // this contact doesn't match the IDL
        // has 'first' instead of 'firstName'
        var contact = {
            contactId: "badcontact",
            userId: "user1",
            first: "Jane",
            lastName: "Doe",
            email: "jane@example.com",
            phones: []
        };
        this.contactService.put(contact, this);
    },
    function verifyErrorAndGetAllContacts(err) {
        if (!err) {
            throw "Didn't get error for invalid contact!";
        }

        this.contactService.getAll("user1", this);
    },
    function putContactsForAnotherUser(err, contacts) {
        if (err) { throw JSON.stringify(err); }

        if (contacts.length !== 1 || contacts[0].contactId !== this.firstContact.contactId) {
            throw "Didn't get back expected contacts. Got: " + contacts[0].contactId;
        }

        var i;
        for (i = 0; i < 10; i++) {
            this.contactService.put(newContact({userId:"user2"}), this.parallel());
        }
    },
    function tryExceedingContactLimit(err) {
        if (err) { throw JSON.stringify(err); }

        this.contactService.put(newContact({userId:"user2"}), this);
    },
    function getAllUser2Contacts(err) {
        if (!err) { 
            throw "Server let us exceed contact limit for user2";
        }

        this.contactService.getAll("user2", this);
    },
    function deleteAllUser2Contacts(err, contacts) {
        if (err) { throw JSON.stringify(err); }

        var i;
        for (i = 0; i < contacts.length; i++) { 
            this.contactService['delete'](contacts[i].contactId, "user2", this.parallel());
        }
    },
    function verifyNoError(err) {
        if (err) { throw JSON.stringify(err); }
    }
);