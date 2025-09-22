package com.bellingham.datafutures.controller;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.bellingham.datafutures.config.JwtProperties;
import com.bellingham.datafutures.controller.dto.LoginRequest;
import com.bellingham.datafutures.controller.dto.RegisterRequest;
import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.security.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest creds,
            HttpServletRequest request) {
        logger.info("Authentication endpoint hit");
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            creds.getUsername(),
                            creds.getPassword()
                    ));
            logger.info("Authentication successful for user: {}", creds.getUsername());
            String token = jwtUtil.generateToken(creds.getUsername());
            Instant expiresAt = jwtUtil.extractExpiration(token).toInstant();

            ResponseCookie cookie = buildSessionCookie(token, Duration.ofMillis(jwtProperties.getExpirationMs()),
                    request.isSecure());
            Map<String, Object> response = new HashMap<>();
            response.put("username", creds.getUsername());
            response.put("expiresAt", expiresAt.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for user: {}", creds.getUsername(), e);
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        ResponseCookie expiredCookie = buildSessionCookie("", Duration.ZERO, request.isSecure());
        Map<String, String> response = Map.of("message", "Logged out");
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .body(response);
    }

    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> session(HttpServletRequest request) {
        String token = resolveTokenFromRequest(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("username", jwtUtil.extractUsername(token));
        response.put("expiresAt", jwtUtil.extractExpiration(token).toInstant().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest request) {
        String username = request.getUsername();
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");

        user.setLegalBusinessName(request.getLegalBusinessName());
        user.setName(request.getName());
        user.setCountryOfIncorporation(request.getCountryOfIncorporation());
        user.setTaxId(request.getTaxId());
        user.setCompanyRegistrationNumber(request.getCompanyRegistrationNumber());
        user.setPrimaryContactName(request.getPrimaryContactName());
        user.setPrimaryContactEmail(request.getPrimaryContactEmail());
        user.setPrimaryContactPhone(request.getPrimaryContactPhone());
        user.setTechnicalContactName(request.getTechnicalContactName());
        user.setTechnicalContactEmail(request.getTechnicalContactEmail());
        user.setTechnicalContactPhone(request.getTechnicalContactPhone());
        user.setCompanyDescription(request.getCompanyDescription());

        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered"));
    }

    @GetMapping("/profile")
    public Map<String, Object> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return Map.of();
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("legalBusinessName", user.getLegalBusinessName());
        map.put("name", user.getName());
        map.put("countryOfIncorporation", user.getCountryOfIncorporation());
        map.put("taxId", user.getTaxId());
        map.put("companyRegistrationNumber", user.getCompanyRegistrationNumber());
        map.put("primaryContactName", user.getPrimaryContactName());
        map.put("primaryContactEmail", user.getPrimaryContactEmail());
        map.put("primaryContactPhone", user.getPrimaryContactPhone());
        map.put("technicalContactName", user.getTechnicalContactName());
        map.put("technicalContactEmail", user.getTechnicalContactEmail());
        map.put("technicalContactPhone", user.getTechnicalContactPhone());
        map.put("companyDescription", user.getCompanyDescription());
        return map;
    }

    @PutMapping("/profile")
    public Map<String, Object> updateProfile(Authentication authentication,
            @RequestBody Map<String, String> updates) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return Map.of();
        }

        if (updates.containsKey("legalBusinessName"))
            user.setLegalBusinessName(updates.get("legalBusinessName"));
        if (updates.containsKey("name"))
            user.setName(updates.get("name"));
        if (updates.containsKey("countryOfIncorporation"))
            user.setCountryOfIncorporation(updates.get("countryOfIncorporation"));
        if (updates.containsKey("taxId"))
            user.setTaxId(updates.get("taxId"));
        if (updates.containsKey("companyRegistrationNumber"))
            user.setCompanyRegistrationNumber(updates.get("companyRegistrationNumber"));
        if (updates.containsKey("primaryContactName"))
            user.setPrimaryContactName(updates.get("primaryContactName"));
        if (updates.containsKey("primaryContactEmail"))
            user.setPrimaryContactEmail(updates.get("primaryContactEmail"));
        if (updates.containsKey("primaryContactPhone"))
            user.setPrimaryContactPhone(updates.get("primaryContactPhone"));
        if (updates.containsKey("technicalContactName"))
            user.setTechnicalContactName(updates.get("technicalContactName"));
        if (updates.containsKey("technicalContactEmail"))
            user.setTechnicalContactEmail(updates.get("technicalContactEmail"));
        if (updates.containsKey("technicalContactPhone"))
            user.setTechnicalContactPhone(updates.get("technicalContactPhone"));
        if (updates.containsKey("companyDescription"))
            user.setCompanyDescription(updates.get("companyDescription"));

        userRepository.save(user);

        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("legalBusinessName", user.getLegalBusinessName());
        map.put("name", user.getName());
        map.put("countryOfIncorporation", user.getCountryOfIncorporation());
        map.put("taxId", user.getTaxId());
        map.put("companyRegistrationNumber", user.getCompanyRegistrationNumber());
        map.put("primaryContactName", user.getPrimaryContactName());
        map.put("primaryContactEmail", user.getPrimaryContactEmail());
        map.put("primaryContactPhone", user.getPrimaryContactPhone());
        map.put("technicalContactName", user.getTechnicalContactName());
        map.put("technicalContactEmail", user.getTechnicalContactEmail());
        map.put("technicalContactPhone", user.getTechnicalContactPhone());
        map.put("companyDescription", user.getCompanyDescription());
        return map;
    }

    private ResponseCookie buildSessionCookie(String value, Duration maxAge, boolean secureTransport) {
        boolean secureAttribute = jwtProperties.getCookie().isSecure() && secureTransport;
        return ResponseCookie.from(jwtProperties.getCookie().getName(), value)
                .httpOnly(true)
                .secure(secureAttribute)
                .sameSite(jwtProperties.getCookie().getSameSite())
                .path(jwtProperties.getCookie().getPath())
                .maxAge(maxAge)
                .build();
    }

    private String resolveTokenFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (jwtProperties.getCookie().getName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
