package com.bellingham.datafutures;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.bellingham.datafutures.config.JwtProperties;
import com.bellingham.datafutures.controller.AuthController;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.security.JwtUtil;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    private static final Instant FIXED_EXPIRY = Instant.parse("2030-01-01T00:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUpMocks() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("user", "pass"));
        when(jwtUtil.generateToken("user")).thenReturn("token-value");
        when(jwtUtil.extractExpiration("token-value"))
                .thenReturn(Date.from(FIXED_EXPIRY.truncatedTo(ChronoUnit.MILLIS)));
        when(jwtUtil.validateToken("token-value")).thenReturn(true);
        when(jwtUtil.extractUsername("token-value")).thenReturn("user");
    }

    @Test
    void loginDowngradesSameSiteWhenNotSecure() throws Exception {
        mockMvc.perform(post("/api/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"user\",\"password\":\"pass\"}")
                        .secure(false))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("SameSite=Lax")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, not(containsString("Secure"))));
    }

    @Test
    void loginKeepsConfiguredSameSiteWhenSecure() throws Exception {
        mockMvc.perform(post("/api/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"user\",\"password\":\"pass\"}")
                        .secure(true))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("SameSite=None")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Secure")));
    }

    @Test
    void sessionFallsBackToAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/session")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer token-value"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.expiresAt").value(FIXED_EXPIRY.truncatedTo(ChronoUnit.MILLIS).toString()));
    }

    @TestConfiguration
    static class AuthControllerTestConfig {

        @Bean
        JwtProperties jwtProperties() {
            JwtProperties properties = new JwtProperties();
            properties.setExpirationMs(3600_000L);
            properties.getCookie().setName("bdf_session");
            properties.getCookie().setSecure(true);
            properties.getCookie().setSameSite("None");
            properties.getCookie().setPath("/");
            return properties;
        }

        @Bean
        AuthenticationManager authenticationManager() {
            return Mockito.mock(AuthenticationManager.class);
        }

        @Bean
        JwtUtil jwtUtil() {
            return Mockito.mock(JwtUtil.class);
        }

        @Bean
        UserRepository userRepository() {
            return Mockito.mock(UserRepository.class);
        }

        @Bean
        PasswordEncoder passwordEncoder() {
            return Mockito.mock(PasswordEncoder.class);
        }

        @Bean
        org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
            return Mockito.mock(org.springframework.security.core.userdetails.UserDetailsService.class);
        }
    }
}
