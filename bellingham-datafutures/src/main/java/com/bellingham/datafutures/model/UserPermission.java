package com.bellingham.datafutures.model;

/**
 * Fine-grained platform permissions that control which marketplace actions
 * a user may perform. Permissions are intentionally independent from Spring
 * Security roles so that administrators can toggle access without changing
 * authentication authorities.
 */
public enum UserPermission {
    BUY,
    SELL;

    public static UserPermission fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Permission value cannot be null");
        }
        return UserPermission.valueOf(value.trim().toUpperCase());
    }
}
