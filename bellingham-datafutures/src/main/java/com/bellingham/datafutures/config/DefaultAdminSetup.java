package com.bellingham.datafutures.config;

import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DefaultAdminSetup {

    @Bean
    public ApplicationRunner ensureDefaultAdmin(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            users.findByUsername("admin").ifPresentOrElse(user -> {
                // If admin exists but password is not encoded, update it
                if (!user.getPassword().startsWith("$2")) {
                    user.setPassword(encoder.encode("admin"));
                    users.save(user);
                    System.out.println("🔑 Updated admin password hash");
                } else {
                    System.out.println("ℹ️ Admin user already present");
                }
            }, () -> {
                User user = new User();
                user.setUsername("admin");
                user.setPassword(encoder.encode("admin"));
                user.setRole("ROLE_USER");
                users.save(user);
                System.out.println("✅ Default admin user created");
            });
        };
    }
}
