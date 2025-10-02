package com.bellingham.datafutures.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

import java.util.EnumSet;

import com.bellingham.datafutures.model.User;
import com.bellingham.datafutures.model.UserPermission;
import com.bellingham.datafutures.repository.UserRepository;

@Configuration
public class DefaultAdminSetup {

    private static final Logger logger = LoggerFactory.getLogger(DefaultAdminSetup.class);
    private static final String ADMIN_USERNAME = "admin";
    private static final int MIN_PASSWORD_LENGTH = 12;

    @Bean
    public ApplicationRunner ensureDefaultAdmin(UserRepository users, PasswordEncoder encoder, Environment environment) {
        return args -> {
            String bootstrapPassword = resolveBootstrapPassword(environment);

            users.findByUsername(ADMIN_USERNAME).ifPresentOrElse(user -> {
                if (!encoder.matches(bootstrapPassword, user.getPassword())) {
                    user.setPassword(encoder.encode(bootstrapPassword));
                }
                if (user.getPermissions().isEmpty()) {
                    user.setPermissions(EnumSet.allOf(UserPermission.class));
                }
                users.save(user);
                logger.info("Admin account synchronized with bootstrap configuration");
            }, () -> {
                User user = new User();
                user.setUsername(ADMIN_USERNAME);
                user.setPassword(encoder.encode(bootstrapPassword));
                user.setRole("ROLE_ADMIN");
                user.setPermissions(EnumSet.allOf(UserPermission.class));
                users.save(user);
                logger.info("Bootstrap admin user created");
            });
        };
    }

    private String resolveBootstrapPassword(Environment environment) {
        String password = environment.getProperty("app.bootstrap.admin-password");
        if (!StringUtils.hasText(password)) {
            password = environment.getProperty("APP_ADMIN_PASSWORD");
        }

        if (!StringUtils.hasText(password)) {
            throw new IllegalStateException("APP_ADMIN_PASSWORD (or app.bootstrap.admin-password) must be set to a strong, non-default value before startup");
        }

        password = password.trim();

        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException("Bootstrap admin password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }

        if ("admin".equalsIgnoreCase(password) || "password".equalsIgnoreCase(password) || "changeme".equalsIgnoreCase(password)) {
            throw new IllegalStateException("Bootstrap admin password cannot use a default or insecure value");
        }

        return password;
    }
}
