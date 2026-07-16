package com.cashplus.ouverture.exception;

public class InvalidStateException extends RuntimeException {

    public InvalidStateException(String message) {
        super(message);
    }

    public InvalidStateException(String entity, String current, String expected) {
        super(String.format("%s is in state '%s', but expected '%s'", entity, current, expected));
    }
}
