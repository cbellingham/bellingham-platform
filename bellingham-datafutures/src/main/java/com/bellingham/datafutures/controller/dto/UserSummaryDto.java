package com.bellingham.datafutures.controller.dto;

import java.util.EnumSet;
import java.util.Set;

import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.model.UserPermission;

public record UserSummaryDto(Long id, String username, String role, Set<UserPermission> permissions) {

    public static UserSummaryDto fromUser(User user) {
        Set<UserPermission> permissions = user.getPermissions().isEmpty()
                ? EnumSet.noneOf(UserPermission.class)
                : EnumSet.copyOf(user.getPermissions());
        return new UserSummaryDto(user.getId(), user.getUsername(), user.getRole(), permissions);
    }
}
