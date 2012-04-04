#
# Makefile for barrister "contact service" demo
#

all: idl

idl:
	barrister -t "Contact Service" -j contact.json -d contact.html contact.idl

