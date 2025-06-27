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
        userRepository.save(user);
        return "User registered";
    }
}
