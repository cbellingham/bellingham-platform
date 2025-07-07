package com.bellingham.datafutures;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BellinghamApplication {
    public static void main(String[] args) {
        SpringApplication.run(BellinghamApplication.class, args);
    }
}
