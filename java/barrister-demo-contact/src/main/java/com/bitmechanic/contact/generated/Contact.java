package com.bitmechanic.contact.generated;

public class Contact implements com.bitmechanic.barrister.BStruct {
    private String lastName;
    private String contactId;
    private Address address;
    private String email;
    private String userId;
    private String firstName;
    private Phone[] phones;

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public void setContactId(String contactId) {
        this.contactId = contactId;
    }

    public String getContactId() {
        return this.contactId;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public Address getAddress() {
        return this.address;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return this.email;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return this.userId;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public void setPhones(Phone[] phones) {
        this.phones = phones;
    }

    public Phone[] getPhones() {
        return this.phones;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("Contact:");
        sb.append(" lastName=").append(lastName);
        sb.append(" contactId=").append(contactId);
        sb.append(" address=").append(address);
        sb.append(" email=").append(email);
        sb.append(" userId=").append(userId);
        sb.append(" firstName=").append(firstName);
        sb.append(" phones=").append(phones);
        return sb.toString();
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) { return true; }
        if (other == null) { return false; }
        if (!(other instanceof Contact)) { return false; }
        Contact _o = (Contact)other;
        if (lastName == null && _o.lastName != null) { return false; }
        else if (lastName != null && !lastName.equals(_o.lastName)) { return false; }
        if (contactId == null && _o.contactId != null) { return false; }
        else if (contactId != null && !contactId.equals(_o.contactId)) { return false; }
        if (address == null && _o.address != null) { return false; }
        else if (address != null && !address.equals(_o.address)) { return false; }
        if (email == null && _o.email != null) { return false; }
        else if (email != null && !email.equals(_o.email)) { return false; }
        if (userId == null && _o.userId != null) { return false; }
        else if (userId != null && !userId.equals(_o.userId)) { return false; }
        if (firstName == null && _o.firstName != null) { return false; }
        else if (firstName != null && !firstName.equals(_o.firstName)) { return false; }
        if (phones == null && _o.phones != null) { return false; }
        else if (phones != null && !java.util.Arrays.equals(phones, _o.phones)) { return false; }
        return true;
    }

    @Override
    public int hashCode() {
        int hash = super.hashCode();
        hash = hash * 31 + (lastName == null ? 0 : lastName.hashCode());
        hash = hash * 31 + (contactId == null ? 0 : contactId.hashCode());
        hash = hash * 31 + (address == null ? 0 : address.hashCode());
        hash = hash * 31 + (email == null ? 0 : email.hashCode());
        hash = hash * 31 + (userId == null ? 0 : userId.hashCode());
        hash = hash * 31 + (firstName == null ? 0 : firstName.hashCode());
        hash = hash * 31 + (phones == null ? 0 : phones.hashCode());
        return hash;
    }
}

