package com.bitmechanic.contact.generated;

public class Address implements com.bitmechanic.barrister.BStruct {
    private String street2;
    private String street1;
    private String postalCode;
    private String state;
    private String country;
    private String city;

    public void setStreet2(String street2) {
        this.street2 = street2;
    }

    public String getStreet2() {
        return this.street2;
    }

    public void setStreet1(String street1) {
        this.street1 = street1;
    }

    public String getStreet1() {
        return this.street1;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getPostalCode() {
        return this.postalCode;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getState() {
        return this.state;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountry() {
        return this.country;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCity() {
        return this.city;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("Address:");
        sb.append(" street2=").append(street2);
        sb.append(" street1=").append(street1);
        sb.append(" postalCode=").append(postalCode);
        sb.append(" state=").append(state);
        sb.append(" country=").append(country);
        sb.append(" city=").append(city);
        return sb.toString();
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) { return true; }
        if (other == null) { return false; }
        if (!(other instanceof Address)) { return false; }
        Address _o = (Address)other;
        if (street2 == null && _o.street2 != null) { return false; }
        else if (street2 != null && !street2.equals(_o.street2)) { return false; }
        if (street1 == null && _o.street1 != null) { return false; }
        else if (street1 != null && !street1.equals(_o.street1)) { return false; }
        if (postalCode == null && _o.postalCode != null) { return false; }
        else if (postalCode != null && !postalCode.equals(_o.postalCode)) { return false; }
        if (state == null && _o.state != null) { return false; }
        else if (state != null && !state.equals(_o.state)) { return false; }
        if (country == null && _o.country != null) { return false; }
        else if (country != null && !country.equals(_o.country)) { return false; }
        if (city == null && _o.city != null) { return false; }
        else if (city != null && !city.equals(_o.city)) { return false; }
        return true;
    }

    @Override
    public int hashCode() {
        int hash = super.hashCode();
        hash = hash * 31 + (street2 == null ? 0 : street2.hashCode());
        hash = hash * 31 + (street1 == null ? 0 : street1.hashCode());
        hash = hash * 31 + (postalCode == null ? 0 : postalCode.hashCode());
        hash = hash * 31 + (state == null ? 0 : state.hashCode());
        hash = hash * 31 + (country == null ? 0 : country.hashCode());
        hash = hash * 31 + (city == null ? 0 : city.hashCode());
        return hash;
    }
}

