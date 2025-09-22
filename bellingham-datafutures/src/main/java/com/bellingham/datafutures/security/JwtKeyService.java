package com.bellingham.datafutures.security;

import com.bellingham.datafutures.config.JwtProperties;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JwtKeyService {

    private final JwtSigningKeyRepository repository;
    private final JwtProperties properties;

    public JwtKeyService(JwtSigningKeyRepository repository, JwtProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    @Transactional
    public JwtSigningKey ensureActiveKey() {
        return repository
                .findByActiveTrue()
                .orElseGet(() -> createInitialKey(properties.getRotation().getInitialKeyId(), properties.getRotation().getInitialSecret()));
    }

    @Transactional
    public JwtSigningKey rotate(String keyId, String secret) {
        if (keyId == null || keyId.isBlank()) {
            throw new IllegalArgumentException("keyId must not be blank when rotating JWT keys.");
        }
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("secret must not be blank when rotating JWT keys.");
        }
        JwtSigningKey current = repository
                .findByActiveTrue()
                .orElseThrow(() -> new IllegalStateException("No active JWT signing key present."));
        current.setActive(false);
        repository.save(current);

        JwtSigningKey newKey = new JwtSigningKey(keyId, secret, true, Instant.now());
        return repository.save(newKey);
    }

    @Transactional
    public void revoke(String keyId) {
        repository
                .findByKeyIdAndRevokedAtIsNull(keyId)
                .ifPresent(key -> {
                    key.setRevokedAt(Instant.now());
                    key.setActive(false);
                    repository.save(key);
                });
    }

    public ActiveSigningKey getActiveSigningKey() {
        JwtSigningKey active = ensureActiveKey();
        return new ActiveSigningKey(active.getKeyId(), buildKey(active.getSecret()));
    }

    public Optional<Key> findVerificationKey(String keyId) {
        return repository
                .findByKeyIdAndRevokedAtIsNull(keyId)
                .map(JwtSigningKey::getSecret)
                .map(this::buildKey);
    }

    private JwtSigningKey createInitialKey(String keyId, String secret) {
        if (keyId == null || keyId.isBlank()) {
            throw new IllegalStateException("jwt.rotation.initial-key-id must be provided to seed the signing key table.");
        }
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("jwt.rotation.initial-secret must be provided to seed the signing key table.");
        }
        JwtSigningKey key = new JwtSigningKey(keyId, secret, true, Instant.now());
        return repository.save(key);
    }

    private Key buildKey(String secret) {
        byte[] raw;
        if (isBase64(secret)) {
            raw = Decoders.BASE64.decode(secret);
        } else {
            raw = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(raw);
    }

    private boolean isBase64(String value) {
        try {
            Decoders.BASE64.decode(value);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    public record ActiveSigningKey(String keyId, Key key) {}
}
