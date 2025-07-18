package com.bellingham.datafutures.service;

import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public void notifyUser(String username, String message) {
        notifyUser(username, message, null, null);
    }

    public void notifyUser(String username, String message, Long contractId, Long bidId) {
        Notification n = new Notification();
        n.setUsername(username);
        n.setMessage(message);
        n.setTimestamp(LocalDateTime.now());
        n.setContractId(contractId);
        n.setBidId(bidId);
        repository.save(n);
    }

    public java.util.List<Notification> getNotifications(String username) {
        return repository.findByUsernameOrderByTimestampDesc(username);
    }

    public void markRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setReadFlag(true);
            repository.save(n);
        });
    }
}
