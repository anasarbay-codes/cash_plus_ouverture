package com.cashplus.ouverture.exception;

public class ForbiddenActionException extends RuntimeException {

    public ForbiddenActionException(String message) {
        super(message);
    }

    public ForbiddenActionException(String action, String requiredRole) {
        super(String.format("Action '%s' requires role: %s", action, requiredRole));
    }
}
