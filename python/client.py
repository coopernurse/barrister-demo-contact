#!/usr/bin/env python

import barrister
import random
import uuid
import sys

########################

# some random names
first_names = [ "Sam", "John", "James", "Zak", "Trevor", "Lori", "Lily", "Minnie" ]
last_names  = [ "Smith", "Doe", "Edwards", "Jacobson", "Myers" ]

def rand_val(arr):
    i = random.randint(0, len(arr)-1)
    return arr[i]

def new_phone(ptype, country, number):
    return { "type"        : ptype,
             "countryCode" : country,
             "number"      : number }

def new_contact(userId, first, last, email, phones=None, address=None):
    if not phones:
        phones = [ ]
    c = { "contactId" : uuid.uuid4().hex,
          "userId"    : userId,
          "firstName" : first,
          "lastName"  : last,
          "email"     : email,
          "phones"    : phones }
    if address:
        c["address"] = address
    return c

########################

trans  = barrister.HttpTransport("http://localhost:7186/contact")
client = barrister.Client(trans)

# Two fictional users, Bob and Mary
bobId  = "user-1"
maryId = "user-2"

# Load all contacts for each user and delete them
for userId in (bobId, maryId):
    for c in client.ContactService.getAll(userId):
        print "Deleting contact: %s" % c["contactId"]
        client.ContactService.delete(c["contactId"], userId)

# Create 10 contacts for Bob, which puts him at his limit
bobContactIds = [ ]
for i in range(10):
    email = "email-%s-%d@example.com" % (bobId, i)
    contact = new_contact(bobId, rand_val(first_names), rand_val(last_names), email)
    contactId = client.ContactService.put(contact)
    bobContactIds.append(contactId)

# Try to add one more.  This should fail
print "Does the server keep us from adding an 11th contact for Bob?"
try:
    email = "deny_me@example.com"
    contact = new_contact(bobId, rand_val(first_names), rand_val(last_names), email)
    client.ContactService.put(contact)
    print "Darn! Bob is over the limit, but server let him add another anyway!"
    sys.exit(1)
except barrister.RpcException as e:
    # prove that we got the correct error code
    assert(e.code == 102)
    print "Yep! Sorry Bob, you have too many contacts!"

# Add 5 contacts for Mary in a batch
maryContactIds = []
batch = client.start_batch()
for i in range(5):
    email = "email-%s-%d@example.com" % (maryId, i)
    contact = new_contact(maryId, rand_val(first_names), rand_val(last_names), email)
    # Note: nothing is returned at this point
    batch.ContactService.put(contact)

result = batch.send()
for i in range(result.count):
    # each result is unmarshaled here, and a RpcException would be thrown
    # if that particular result in the batch failed
    maryContactIds.append(result.get(i))

print "Mary has %d contacts now" % len(maryContactIds)

# Add another contact with an address
addr = { "street1": "1234 Main", "city": "Seattle", "state": "WA",
         "postalCode": "98102", "country": "USA" }
email = "contact-with-addr@example.com"
contact = new_contact(maryId, rand_val(first_names), rand_val(last_names), email, address=addr)
contactId = client.ContactService.put(contact)
contact = client.ContactService.get(contactId, maryId)
assert(addr == contact["address"])
print "Saved and loaded contact with address!"
maryContactIds.append(contactId)

# Test null responses
contact = client.ContactService.get("not-valid-id", bobId)
assert(contact == None)

# Delete Mary's contacts
for cid in maryContactIds:
    assert(client.ContactService.delete(cid, maryId) == True)

print "Deleted Mary's contacts.."

# Verify that delete on a non-existant contact id returns False
assert(client.ContactService.delete(maryContactIds[0], maryId) == False)

# Verify that Mary can't delete one of Bob's contacts
try:
    client.ContactService.delete(bobContactIds[0], maryId)
except barrister.RpcException as e:
    assert(e.code == 101)

# Try sending the wrong data
print "Trying a malformed contact"
try:
    bad = { "first" : "Sam", "last" : "Jones", "email" : "foo@bar.com" }
    client.ContactService.put(bad)
    print "Error! Server let us put an invalid contact: %s" % bad
    sys.exit(1)
except barrister.RpcException as e:
    # this crazy number comes from the JSON-RPC 2.0 spec, which 
    # we are basing our message formats off of:
    # http://jsonrpc.org/specification
    # -32602 == invalid method parameters
    assert(e.code == -32602)
    print "Malform contact was rejected as expected with msg: %s" % e.msg

print "Contact client tests successful!"
