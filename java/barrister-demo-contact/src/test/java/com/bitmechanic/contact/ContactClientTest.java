package com.bitmechanic.contact;

import junit.framework.TestCase;

import com.bitmechanic.barrister.HttpTransport;
import com.bitmechanic.contact.generated.Contact;
import com.bitmechanic.contact.generated.Phone;
import com.bitmechanic.contact.generated.PhoneType;
import com.bitmechanic.contact.generated.Address;
import com.bitmechanic.contact.generated.ContactServiceClient;

public class ContactClientTest extends TestCase {

    public void testPutGetDelete() throws Exception {
        String endpoint = "http://localhost:8080/barrister-demo-contact/contact";
        HttpTransport trans = new HttpTransport(endpoint);
        ContactServiceClient client = new ContactServiceClient(trans);

        Contact c = new Contact();
        c.setFirstName("John");
        c.setLastName("Doe");
        c.setEmail("john@example.com");
        c.setContactId("john-123");
        c.setUserId("user-123");
        c.setPhones(new Phone[0]);

        String contactId = client.put(c);
        assertEquals(contactId, c.getContactId());

        Contact c2 = client.get(contactId, c.getUserId());
        assertEquals(c, c2);

        assertTrue(client.delete(contactId, c.getUserId()));
    }

}