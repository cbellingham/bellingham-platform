package com.bellingham.datafutures.controller;

import org.springframework.security.core.AuthenticationException;
import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.repository.UserRepository;
import com.bellingham.datafutures.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/authenticate")
    public Map<String, String> login(@RequestBody Map<String, String> creds) {
        System.out.println("🔥 AUTH ENDPOINT HIT");
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            creds.get("username"),
                            creds.get("password")
                    ));
            System.out.println("✅ AUTH SUCCESSFUL for user: " + creds.get("username"));
            String token = jwtUtil.generateToken(creds.get("username"));
            Map<String, String> response = new HashMap<>();
            response.put("id_token", token);
            return response;
        } catch (AuthenticationException e) {
            System.out.println("❌ AUTH FAILED: " + e.getMessage());
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @PostMapping("/register-default")
    public String registerDefaultUser() {
        if (userRepository.findByUsername("admin").isPresent()) {
            return "Admin already exists";
        }
        User user = new User();
        user.setUsername("admin");
        user.setPassword(encoder.encode("admin")); // bcrypt
        user.setRole("ROLE_USER");
        userRepository.save(user);
        return "✅ Default user created";
    }

    @PostMapping("/register")
    public String registerUser(@RequestBody Map<String, String> creds) {
        String username = creds.get("username");
        String password = creds.get("password");
        if (username == null || password == null) {
            return "Username and password required";
        }
        if (userRepository.findByUsername(username).isPresent()) {
            return "Username already exists";
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        user.setRole("ROLE_USER");

        user.setLegalBusinessName(creds.get("legalBusinessName"));
        user.setName(creds.get("name"));
        user.setCountryOfIncorporation(creds.get("countryOfIncorporation"));
        user.setTaxId(creds.get("taxId"));
        user.setCompanyRegistrationNumber(creds.get("companyRegistrationNumber"));
        user.setPrimaryContactName(creds.get("primaryContactName"));
        user.setPrimaryContactEmail(creds.get("primaryContactEmail"));
        user.setPrimaryContactPhone(creds.get("primaryContactPhone"));
        user.setTechnicalContactName(creds.get("technicalContactName"));
        user.setTechnicalContactEmail(creds.get("technicalContactEmail"));
        user.setTechnicalContactPhone(creds.get("technicalContactPhone"));
        user.setCompanyDescription(creds.get("companyDescription"));

        userRepository.save(user);
        return "User registered";
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
}
