package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getNotifications(Authentication authentication) {
        String username = authentication.getName();
        return notificationService.getNotifications(username);
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Authentication authentication) {
        notificationService.markRead(id, authentication.getName());
    }
}
