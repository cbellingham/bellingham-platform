package com.bellingham.datafutures;

import com.bellingham.datafutures.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
@EnableScheduling
public class BellinghamApplication {
    public static void main(String[] args) {
        SpringApplication.run(BellinghamApplication.class, args);
    }
}
