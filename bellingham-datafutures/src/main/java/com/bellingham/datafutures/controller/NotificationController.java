package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.NotificationStreamService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationStreamService notificationStreamService;

    public NotificationController(NotificationService notificationService,
                                  NotificationStreamService notificationStreamService) {
        this.notificationService = notificationService;
        this.notificationStreamService = notificationStreamService;
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

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication authentication) {
        return notificationStreamService.subscribe(authentication.getName());
    }
}
