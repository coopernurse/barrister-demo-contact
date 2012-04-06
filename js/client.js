var step      = require('step');
var barrister = require('barrister');

// convenience function for creating a "Contact" struct with
// the correct fields
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

// toy example of a trace logging callback function
// you could do something more exotic like log to syslog,
// a file, or a logging framework
function log(s) {
    console.log(s);
}

// 
// Using the node.js "step" package here to execute our 
// async RPC calls sequentially.  For more info, go to:
// https://github.com/creationix/step
// 
// A quick overview of step:
//    - Always pass 'this' as the callback function when
//      calling an async function
//    - When the 'this' callback is invoked, the next function
//      in the list is called
//    - parallel() can be used to run several commands at once.
//      when the last one finishes, the next function in the chain is run
// 
step(
    function initClient() {
        // Create a HTTP client with the given URL endpoint
        this.client = barrister.httpClient("http://localhost:3000/contact");

        // Turn on trace logging.  This will invoke the 'log' function
        // passed in with a JSON representation of each request sent, and
        // response received.  Lets you inspect all the raw traffic to/from the
        // server.
        // 
        // Turn off with:  client.disableTrace();
        //
        this.client.enableTrace(log);

        // Client will make a RPC request to the server to load the IDL for
        // this endpoint.  This step is required before you can use the
        // client to make requests.
        this.client.loadContract(this);
    },
    function putOneContact(err) {
        // ensure loadContract() didn't return an error
        if (err) { throw JSON.stringify(err); }

        // client.proxy() takes a string name of an interface on the
        // IDL.  It returns an object that has functions on it that 
        // match the names of the functions on the interface.  
        // 
        // You call functions on the proxy to make RPC calls
        //
        this.contactService = this.client.proxy("ContactService");

        this.firstContact = newContact({});

        // Notice that the arguments to RPC functions ("put" in this case)
        // match the order of arguments in the IDL, but with an additional
        // callback function on the end.  The callback will be invoked
        // when the request completes.  The callback receives (error, result)
        // where error is null if the request succeeds, and is a JSON-RPC
        // style error if it fails.  JSON-RPC errors are objects with three
        // fields:  'code', 'message', 'data' (optional)
        // 
        this.contactService.put(this.firstContact, this);
    },
    function putInvalidContact(err, contactId) {
        if (err) { throw JSON.stringify(err); }

        // contactService.put() returns the contactId, so let's
        // verify that we got the ID we sent
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

        // Send the invalid contact.  should fail.
        this.contactService.put(contact, this);
    },
    function verifyErrorAndGetAllContacts(err) {
        if (!err) {
            // should never get here.
            throw "Didn't get error for invalid contact!";
        }

        // load all contacts for 'user1'
        this.contactService.getAll("user1", this);
    },
    function batchPut(err) {
        if (err) { throw JSON.stringify(err); }

        // create a batch proxy for our client
        var batch = this.client.startBatch();
        var batchContactService = batch.proxy("ContactService");

        var i;
        for (i = 0; i < 2; i++) {
            // note: no callback here, as we're just queueing the
            // requests locally on the batch
            batchContactService.put(newContact({}));
        }

        // batch send() takes the callback
        batch.send(this);
    },
    function putContactsForAnotherUser(errors, results) {
        var i, o;
        if (errors) {
            console.log("Got batch errors: " + JSON.stringify(errors));
            for (i = 0; i < errors.length; i++) {
                o = errors[i];
                console.log("  interface=" + o.iface + " func=" + o.func +
                            " params=" + o.params + 
                            " err code=" + o.error.code + " err msg=" + o.error.message);
            }
            process.exit(1);
        }

        // look at the batch results
        for (i = 0; i < results.length; i++) {
            o = results[i];
            if (o.params[0].contactId !== o.result) {
                throw "Batch result contactId != input contactId!";
            }
        }

        // create 10 contacts for user2
        for (i = 0; i < 10; i++) {
            this.contactService.put(newContact({userId:"user2"}), this.parallel());
        }
    },
    function tryExceedingContactLimit(err) {
        if (err) { throw JSON.stringify(err); }

        // try to add an 11th contact for user2, which should generate an error
        this.contactService.put(newContact({userId:"user2"}), this);
    },
    function getAllUser2Contacts(err) {
        if (!err) { 
            throw "Server let us exceed contact limit for user2";
        }

        // load all contacts for 'user2'
        this.contactService.getAll("user2", this);
    },
    function deleteAllUser2Contacts(err, contacts) {
        if (err) { throw JSON.stringify(err); }

        // delete all 'user2' contacts 
        // note the use of "parallel()" here -- that's a Step thing
        var i;
        for (i = 0; i < contacts.length; i++) { 
            this.contactService['delete'](contacts[i].contactId, "user2", this.parallel());
        }
    },
    function verifyNoError(err) {
        // when parallel() is used, Step will send the next function in the chain
        // an err if _any_ of the parallel calls failed
        if (err) { throw JSON.stringify(err); }
    }
);