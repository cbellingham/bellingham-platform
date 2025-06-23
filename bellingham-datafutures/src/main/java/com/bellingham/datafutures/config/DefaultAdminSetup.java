package com.bellingham.datafutures.config;

import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DefaultAdminSetup {

    @Bean
    public CommandLineRunner ensureDefaultAdmin(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (users.findByUsername("admin").isEmpty()) {
                User user = new User();
                user.setUsername("admin");
                user.setPassword(encoder.encode("admin"));
                user.setRole("ROLE_USER");
                users.save(user);
                System.out.println("✅ Default admin user created");
            }
        };
    }
}
