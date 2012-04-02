package com.bitmechanic.contact.generated;


public interface ContactService {

    public String put(Contact contact) throws com.bitmechanic.barrister.RpcException;
    public Contact get(String contactId, String userId) throws com.bitmechanic.barrister.RpcException;
    public Contact[] getAll(String userId) throws com.bitmechanic.barrister.RpcException;
    public Boolean delete(String contactId, String userId) throws com.bitmechanic.barrister.RpcException;

}

