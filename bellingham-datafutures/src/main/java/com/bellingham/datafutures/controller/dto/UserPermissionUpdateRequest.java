package com.bellingham.datafutures.controller.dto;

import java.util.EnumSet;
import java.util.Set;

import com.bellingham.datafutures.model.UserPermission;

public record UserPermissionUpdateRequest(Set<UserPermission> permissions) {

    public UserPermissionUpdateRequest {
        if (permissions == null) {
            permissions = EnumSet.noneOf(UserPermission.class);
        } else if (permissions.isEmpty()) {
            permissions = EnumSet.noneOf(UserPermission.class);
        } else if (!(permissions instanceof EnumSet<UserPermission>)) {
            permissions = EnumSet.copyOf(permissions);
        }
    }

    public static UserPermissionUpdateRequest fromStrings(Iterable<String> values) {
        EnumSet<UserPermission> set = EnumSet.noneOf(UserPermission.class);
        if (values != null) {
            for (String value : values) {
                set.add(UserPermission.fromString(value));
            }
        }
        return new UserPermissionUpdateRequest(set);
    }
}
