package com.bitmechanic.contact;

import com.bitmechanic.barrister.RpcException;
import com.bitmechanic.contact.generated.*;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.UUID;

public class ContactServiceImpl implements ContactService {

    enum CustomErr {
        INVALID(100, "Invalid %s"),
        DENIED(101, "Permission denied: %s"),
        LIMIT(102, "Limit exceeded: %s");

        private int code;
        private String msgFormat;

        CustomErr(int code, String msgFormat) {
            this.code = code;
            this.msgFormat = msgFormat;
        }

        RpcException toException(String... msgArgs) {
            return new RpcException(code, String.format(msgFormat, msgArgs));
        }
    }

    //////////////

    private HashMap<String,Contact> byId = new HashMap<String,Contact>();

    public String put(Contact contact) throws RpcException {
        String contactId = getOrCreateId(contact);
        if (!byId.containsKey(contactId)) {
            String userId = contact.getUserId();
            if (getAll(userId).length >= 10) {
                throw CustomErr.LIMIT.toException("User " + userId + " has 10 or more contacts");
            }
        }
        byId.put(contactId, contact);
        return contactId;
    }

    public Contact get(String contactId, String userId) throws RpcException {
        Contact c = byId.get(contactId);
        if (c == null || c.getUserId().equals(userId)) {
            return c;
        }
        else {
            throw CustomErr.DENIED.toException("User " + userId + " doesn't own contact: " + contactId);
        }
    }

    public Contact[] getAll(String userId) throws RpcException {
        ArrayList<Contact> list = new ArrayList<Contact>();
        for (Contact c : byId.values()) {
            if (c.getUserId().equals(userId)) {
                list.add(c);
            }
        }
        return list.toArray(new Contact[0]);
    }

    public Boolean delete(String contactId, String userId) throws RpcException {
        Contact c = get(contactId, userId);
        if (c == null) {
            return false;
        }
        else {
            byId.remove(contactId);
            return true;
        }
    }

    private String getOrCreateId(Contact contact) {
        if (contact.getContactId() == null) {
            contact.setContactId(UUID.randomUUID().toString());
        }
        return contact.getContactId();
    }

}