package com.bellingham.datafutures.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    private long expirationMs;
    private Rotation rotation = new Rotation();

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public Rotation getRotation() {
        return rotation;
    }

    public void setRotation(Rotation rotation) {
        this.rotation = rotation;
    }

    public static class Rotation {
        private String initialKeyId;
        private String initialSecret;

        public String getInitialKeyId() {
            return initialKeyId;
        }

        public void setInitialKeyId(String initialKeyId) {
            this.initialKeyId = initialKeyId;
        }

        public String getInitialSecret() {
            return initialSecret;
        }

        public void setInitialSecret(String initialSecret) {
            this.initialSecret = initialSecret;
        }
    }
}
