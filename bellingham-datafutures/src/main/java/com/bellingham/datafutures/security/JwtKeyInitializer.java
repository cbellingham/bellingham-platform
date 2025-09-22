package com.bellingham.datafutures.security;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class JwtKeyInitializer implements CommandLineRunner {

    private final JwtKeyService jwtKeyService;

    public JwtKeyInitializer(JwtKeyService jwtKeyService) {
        this.jwtKeyService = jwtKeyService;
    }

    @Override
    public void run(String... args) {
        jwtKeyService.ensureActiveKey();
    }
}
