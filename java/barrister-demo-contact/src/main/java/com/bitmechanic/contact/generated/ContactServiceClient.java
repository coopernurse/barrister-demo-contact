package com.bitmechanic.contact.generated;

public class ContactServiceClient implements ContactService {

    private com.bitmechanic.barrister.Transport _trans;

    public ContactServiceClient(com.bitmechanic.barrister.Transport trans) {
        trans.getContract().setPackage("com.bitmechanic.contact.generated");
        this._trans = trans;
    }

    public String put(Contact contact) throws com.bitmechanic.barrister.RpcException {
        Object _params = contact;
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "ContactService.put", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp.getError() == null) {
            return (String)_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

    public Contact get(String contactId, String userId) throws com.bitmechanic.barrister.RpcException {
        Object _params = new Object[] { contactId, userId };
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "ContactService.get", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp.getError() == null) {
            return (Contact)_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

    public Contact[] getAll(String userId) throws com.bitmechanic.barrister.RpcException {
        Object _params = userId;
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "ContactService.getAll", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp.getError() == null) {
            return (Contact[])_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

    public Boolean delete(String contactId, String userId) throws com.bitmechanic.barrister.RpcException {
        Object _params = new Object[] { contactId, userId };
        com.bitmechanic.barrister.RpcRequest _req = new com.bitmechanic.barrister.RpcRequest(java.util.UUID.randomUUID().toString(), "ContactService.delete", _params);
        com.bitmechanic.barrister.RpcResponse _resp = this._trans.request(_req);
        if (_resp.getError() == null) {
            return (Boolean)_resp.getResult();
        }
        else {
            throw _resp.getError();
        }
    }

}

