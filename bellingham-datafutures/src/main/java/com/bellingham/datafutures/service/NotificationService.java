package com.bellingham.datafutures.service;

import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final NotificationStreamService streamService;

    public NotificationService(NotificationRepository repository, NotificationStreamService streamService) {
        this.repository = repository;
        this.streamService = streamService;
    }

    public void notifyUser(String username, String message) {
        notifyUser(username, message, null);
    }

    public void notifyUser(String username, String message, Long contractId) {
        Notification n = new Notification();
        n.setUsername(username);
        n.setMessage(message);
        n.setTimestamp(LocalDateTime.now());
        n.setContractId(contractId);
        Notification saved = repository.save(n);
        streamService.sendNotification(username, saved);
    }

    public java.util.List<Notification> getNotifications(String username) {
        return repository.findByUsernameOrderByTimestampDesc(username);
    }

    public void markRead(Long id, String username) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify notifications for another user");
        }

        notification.setReadFlag(true);
        Notification saved = repository.save(notification);
        streamService.sendNotification(username, saved);
    }
}
