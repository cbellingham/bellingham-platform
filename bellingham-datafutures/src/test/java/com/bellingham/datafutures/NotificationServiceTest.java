package com.bellingham.datafutures;

import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.repository.NotificationRepository;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.NotificationStreamService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import({NotificationService.class, NotificationStreamService.class})
@ActiveProfiles("test")
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void notifyUserPersistsNotification() {
        notificationService.notifyUser("alice", "hello", 5L);

        List<Notification> all = notificationRepository.findAll();
        assertThat(all).hasSize(1);
        Notification n = all.get(0);
        assertThat(n.getUsername()).isEqualTo("alice");
        assertThat(n.getMessage()).isEqualTo("hello");
        assertThat(n.isReadFlag()).isFalse();
        assertThat(n.getContractId()).isEqualTo(5L);
    }

    @Test
    void notifyUserWithoutContractPersistsNullContract() {
        notificationService.notifyUser("bob", "hi");

        List<Notification> all = notificationRepository.findAll();
        assertThat(all).hasSize(1);
        Notification n = all.get(0);
        assertThat(n.getContractId()).isNull();
    }

    @Test
    void markReadUpdatesFlag() {
        Notification n = new Notification();
        n.setUsername("bob");
        n.setMessage("msg");
        n.setTimestamp(LocalDateTime.now());
        notificationRepository.save(n);

        notificationService.markRead(n.getId(), "bob");

        Notification updated = notificationRepository.findById(n.getId()).orElseThrow();
        assertThat(updated.isReadFlag()).isTrue();
    }

    @Test
    void markReadThrowsWhenNotificationMissing() {
        assertThatThrownBy(() -> notificationService.markRead(999L, "bob"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
