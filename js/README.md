# Barrister Contact Demo - JS Impl

To install Barrister for node.js, see: 
https://github.com/coopernurse/barrister-js

In this tutorial we'll use the barrister-js bindings to write a Node.js client and server and a 
browser based client for a fictitous Contact Service.

The **parent directory** contains the plain IDL file and its JSON representation.
Please refer to these files as we go along:

* `../contact.idl` - IDL file
* `server.js` - Implementation of the IDL using Node.js and [Express](http://expressjs.com/)
* `client.js` - Client program that demonstrates how to call the service, trap errors, and 
  use batches.  Uses [Step](https://github.com/creationix/step) to ensure the requests are
  chained in a synchronous manner.
* `static/client.html` - Browser based client that uses the same API as client.js, just packaged a bit differently so it can be loaded in the browser.

### Running the example

    # clone the repo
    git clone git://github.com/coopernurse/barrister-demo-contact.git
    
    # install dependencies
    cd barrister-demo-contact/js
    npm install express step
    
    # start server in background
    node server.py &
    
    # run the client - should get a bunch of output 
    node client.py
    
    Then in your browser, try loading:
    http://localhost:3000/client.html
    
    Back at the terminal:
    fg      (to foreground the server)
    ctrl-c  (to quit the server)

### How it works

First we have to write our interface definition, which is in `contact.idl`.  An IDL file may contain
many interfaces, but this example only has one:

    interface ContactService {
        put(contact Contact) string
        get(contactId string, userId string) Contact
        getAll(userId string) []Contact
        delete(contactId string, userId string) bool
    }

Notice that you can use structs as parameters or return types.  `[]` denotes an array.  The type 
follows the identifier.

Structs can reference other structs or enums, in addition to primitive types.  Notice that the `Contact`
has an array of `Phone` objects:

    struct Contact {
      contactId string
      userId    string
      firstName string
      lastName  string
      email     string
      phones    []Phone
      address   Address   [optional]
    }    

The `[optional]` string tells Barrister that address is not required.  By default all struct 
fields are required, and Barrister will automatically reject requests with missing fields.

The `[]Phone` field is not optional, but empty arrays are permitted.  A missing `phone` field, or
one set to `null` would be considered invalid.

### Understanding the implementation

Take a moment to read the `client.js` and `server.js` code.  The comments in the code
will hopefully clarify how things work.  Rather than repeat those comments here, we'll focus on the 
less obvious bits.

### Creating a Client

When consuming a Barrister service from Node, you'll create a `Client` and load the contract.  

Here's how that would look in Node.js:

    var barrister = require('barrister');
    var client = barrister.httpClient("http://localhost:3000/contact");
    client.enableTrace();   // log to console.log.  optional.
    client.loadContract(function(err) {
        if (err) { throw err; }
        
        // contract successfully loaded -- you can now use client to make requests
    });
    
And in a browser:

    <!-- used to make the POST request, but that can be overridden (see below) -->
    <script type="text/javascript" src="jquery-1.6.4.min.js"></script>
    
    <!-- For browsers that don't include the JSON global object
         See: https://github.com/douglascrockford/JSON-js -->
    <script type="text/javascript" src="json2.min.js"></script>
    
    <!-- Barrister itself.  A non-minified version is also available -->
    <script type="text/javascript" src="barrister.browser.min.js"></script>
    
    <script type="text/javascript">

      jQuery(document).ready(function() {
        var client = Barrister.httpClient("/contact");
        client.enableTrace();
        client.loadContract(function(err) {
            if (err) { 
                alert("Unable to load contract: " + err);
            }
            else {
                // contract successfully loaded -- you can now use client to make requests
            }
        });
      });
      
    </script>
    
A few notes about the browser implementation:

* jQuery is used to make the POST request inside Barrister, but it can be swapped out by 
  passing a function to `Barrister.httpClient()` instead of a string. See the 
  [src/browser_footer.js](https://github.com/coopernurse/barrister-js/blob/master/src/browser_footer.js)
  file for the default implementation and notes
   
### Making requests

To invoke a function, create a proxy object for the interface you wish to call.  The proxy
will have functions hung off it that match the functions for the interface in the IDL.

For example, to use the ContactService:

    // assume we already initialized the client per the above example, then:
    var clientService = client.proxy("ContactService");
    
    // now we can call functions on that service:
    //   params to function should match the params in the IDL for that function
    //   with an additional callback function at the end, which is called with the result
    //
    // callback gets an error (null if request succeeds) and the result (null if request fails)
    //
    // result type will match the result type for the function in the IDL
    clientService.put(contact, function(err, contactId) {
        if (err) {
            // err is a JSON-RPC error with 'code', 'message', and (optional) 'data' keys
            console.log("error in put()  code=" + err.code + " msg=" + err.message);
        }
        else {
            console.log("successfully put() contact with id: " + contactId);
        }
    });

### Malformed requests

One of Barrister's selling points is that it helps ensure that requests and responses match the types
defined in the IDL so that you don't have to manually deal with that validation in your application.

You can see an example of this in `client.js` - `putInvalidContact`.  In that function we create
with invalid property (`firstName` field is misnamed as `first`).  When we call `put()` an error is
returned.  If you look at `server.js` there's no validation code in `put()` that would reject
the request in that case.  The error is generated by Barrister automatically.

### Client request validation

By default clients will validate their own requests, which eliminates the need for a server
round trip in the case of malformed request data. If you wish to disable client request validation:

    // create client
    var client = Barrister.httpClient("/contact");
    
    // turn off validation
    client.validateRequest = false;

### Error handling

If a RPC call fails, the proxy function will provide an `error` object containing `code`,
`message`, and (optionally) `data` fields.

`code` is an integer that indicates the error type. The 
[JSON-RPC 2.0 spec](http://jsonrpc.org/specification) defines some built in
error codes for things like malformed JSON, invalid request params, etc.  Barrister supports these
codes and returns them if request parsing or validation fails.  

`message` is a human readable description of the error.  `data` is an opaque entity that provides
more error specific information.  It is not included by default and the meaning is application
specific (meaning whatever your server sends is what will be here).

In your server code you may define your own error codes.  In our IDL we define 3 different codes 
that are meaningful to us.  For example, error 102 means "limit exceeded" which we return if
a user tries to add more than 10 contacts.  Stick to postive integers in your error codes to avoid
conflicts with the JSON-RPC built in codes.

See `server.js` for some examples of returning custom errors.

### Batch Requests

Barrister allows you to batch multiple requests in a single call, which can speed things up if your
requests are small and the HTTP/network overhead becomes noticeable.  To use a batch:

    // create a batch from the client
    var batch = client.startBatch();
    
    // create a proxy from the batch
    var contactService = batch.proxy("ContactService");
    
    // call functions on the proxy
    // NOTE: you do NOT pass a callback at this point, since
    //       no network request is being made here.
    contactService.put(contactA);
    contactService.put(contactB);
    
    // send the batch - this takes the callback
    // errors is null if all requests in batch succeed
    //
    // use results[i].result to get the return value from each call
    batch.send(function(errors, results) {        
        var i, o;
        if (errors) {
            console.log("Got " + errors.length + " error(s)");
            for (i = 0; i < errors.length; i++) {
                o = errors[i];
                console.log(" method=" + o.method + " params=" + o.params + 
                            " err code=" + o.error.code + " err msg=" + o.error.message);
            }
        }
        
        if (results) {
            console.log("Got " + results.length + " success(es)");
            for (i = 0; i < results.length; i++) {
                o = results[i];
                console.log("  method=" + o.method + " params=" + o.params +
                            " result=" + o.result);
            }
        }
    });

## More information

### IDL Syntax

The [main Barrister docs](http://barrister.bitmechanic.com/docs.html) explain how to write an IDL file and
run the `barrister` tool to convert it to a `json` file.

