package com.bitmechanic.contact.generated;

public class Phone implements com.bitmechanic.barrister.BStruct {
    private Long countryCode;
    private Long number;
    private PhoneType type;

    public void setCountryCode(Long countryCode) {
        this.countryCode = countryCode;
    }

    public Long getCountryCode() {
        return this.countryCode;
    }

    public void setNumber(Long number) {
        this.number = number;
    }

    public Long getNumber() {
        return this.number;
    }

    public void setType(PhoneType type) {
        this.type = type;
    }

    public PhoneType getType() {
        return this.type;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("Phone:");
        sb.append(" countryCode=").append(countryCode);
        sb.append(" number=").append(number);
        sb.append(" type=").append(type);
        return sb.toString();
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) { return true; }
        if (other == null) { return false; }
        if (!(other instanceof Phone)) { return false; }
        Phone _o = (Phone)other;
        if (countryCode == null && _o.countryCode != null) { return false; }
        else if (countryCode != null && !countryCode.equals(_o.countryCode)) { return false; }
        if (number == null && _o.number != null) { return false; }
        else if (number != null && !number.equals(_o.number)) { return false; }
        if (type == null && _o.type != null) { return false; }
        else if (type != null && !type.equals(_o.type)) { return false; }
        return true;
    }

    @Override
    public int hashCode() {
        int hash = super.hashCode();
        hash = hash * 31 + (countryCode == null ? 0 : countryCode.hashCode());
        hash = hash * 31 + (number == null ? 0 : number.hashCode());
        hash = hash * 31 + (type == null ? 0 : type.hashCode());
        return hash;
    }
}

