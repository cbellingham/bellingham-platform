package com.bellingham.datafutures;

import com.bellingham.datafutures.controller.NotificationController;
import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.NotificationStreamService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class NotificationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private NotificationStreamService notificationStreamService;

    @Test
    void getNotificationsReturnsResults() throws Exception {
        Notification n = new Notification();
        n.setId(1L);
        n.setUsername("user");
        n.setMessage("hello");
        n.setTimestamp(LocalDateTime.now());
        given(notificationService.getNotifications("user"))
                .willReturn(List.of(n));

        mockMvc.perform(get("/api/notifications")
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("hello"));
    }

    @Test
    void markReadCallsService() throws Exception {
        mockMvc.perform(post("/api/notifications/5/read")
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk());

        verify(notificationService).markRead(5L, "user");
    }

    @Test
    void streamRegistersEmitter() throws Exception {
        given(notificationStreamService.subscribe("user"))
                .willReturn(new SseEmitter(0L));

        mockMvc.perform(get("/api/notifications/stream")
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .contentTypeCompatibleWith(org.springframework.http.MediaType.TEXT_EVENT_STREAM));

        verify(notificationStreamService).subscribe("user");
    }
}
