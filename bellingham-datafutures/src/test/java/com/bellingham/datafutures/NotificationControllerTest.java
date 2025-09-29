package com.bellingham.datafutures;

import com.bellingham.datafutures.controller.NotificationController;
import com.bellingham.datafutures.model.Notification;
import com.bellingham.datafutures.service.NotificationService;
import com.bellingham.datafutures.service.NotificationStreamService;
import com.bellingham.datafutures.security.JwtFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
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

    @MockBean
    private JwtFilter jwtFilter;

    @Test
    void getNotificationsReturnsResults() throws Exception {
        Notification n = new Notification();
        n.setId(1L);
        n.setUsername("user");
        n.setMessage("hello");
        n.setTimestamp(LocalDateTime.now());
        given(notificationService.getNotifications("user"))
                .willReturn(List.of(n));

        try {
            mockMvc.perform(get("/api/notifications").with(authenticatedRequest()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].message").value("hello"));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void markReadCallsService() throws Exception {
        try {
            mockMvc.perform(post("/api/notifications/5/read").with(authenticatedRequest()))
                    .andExpect(status().isOk());
        } finally {
            SecurityContextHolder.clearContext();
        }

        verify(notificationService).markRead(5L, "user");
    }

    @Test
    void streamRegistersEmitter() throws Exception {
        given(notificationStreamService.subscribe("user"))
                .willReturn(new SseEmitter(0L));

        try {
            mockMvc.perform(get("/api/notifications/stream").with(authenticatedRequest()))
                    .andExpect(status().isOk());
        } finally {
            SecurityContextHolder.clearContext();
        }

        verify(notificationStreamService).subscribe("user");
    }

    private RequestPostProcessor authenticatedRequest() {
        return request -> {
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(new UsernamePasswordAuthenticationToken("user", "pass", java.util.Collections.emptyList()));
            SecurityContextHolder.setContext(context);
            return request;
        };
    }
}
