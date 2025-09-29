package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.NotificationStreamService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
        String username = resolveUsername(authentication);
        return notificationService.getNotifications(username);
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Authentication authentication) {
        notificationService.markRead(id, resolveUsername(authentication));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication authentication) {
        return notificationStreamService.subscribe(resolveUsername(authentication));
    }

    private String resolveUsername(Authentication authentication) {
        Authentication auth = authentication != null ? authentication : SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        return auth.getName();
    }
}
