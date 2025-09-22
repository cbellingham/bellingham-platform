package com.bellingham.datafutures.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    private long expirationMs;
    private Rotation rotation = new Rotation();
    private Cookie cookie = new Cookie();

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

    public Cookie getCookie() {
        return cookie;
    }

    public void setCookie(Cookie cookie) {
        this.cookie = cookie;
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

    public static class Cookie {
        private String name = "bdf_session";
        private boolean secure = true;
        private String sameSite = "None";
        private String path = "/";

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isSecure() {
            return secure;
        }

        public void setSecure(boolean secure) {
            this.secure = secure;
        }

        public String getSameSite() {
            return sameSite;
        }

        public void setSameSite(String sameSite) {
            this.sameSite = sameSite;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }
    }
}
