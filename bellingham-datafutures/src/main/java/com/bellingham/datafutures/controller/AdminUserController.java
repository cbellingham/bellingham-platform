package com.bellingham.datafutures.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bellingham.datafutures.controller.dto.UserPermissionUpdateRequest;
import com.bellingham.datafutures.controller.dto.UserSummaryDto;
import com.bellingham.datafutures.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserSummaryDto> listUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryDto::fromUser)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<UserSummaryDto> updatePermissions(@PathVariable Long id,
            @RequestBody UserPermissionUpdateRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setPermissions(request.permissions());
                    userRepository.save(user);
                    return ResponseEntity.ok(UserSummaryDto.fromUser(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
