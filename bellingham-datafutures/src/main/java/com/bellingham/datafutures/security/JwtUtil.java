package com.bellingham.datafutures.security;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.bellingham.datafutures.config.JwtProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;

@Component
public class JwtUtil {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final JwtProperties jwtProperties;
    private final JwtKeyService jwtKeyService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtUtil(JwtProperties jwtProperties, JwtKeyService jwtKeyService) {
        this.jwtProperties = jwtProperties;
        this.jwtKeyService = jwtKeyService;
    }

    public String generateToken(String username) {
        JwtKeyService.ActiveSigningKey activeSigningKey = jwtKeyService.getActiveSigningKey();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpirationMs()))
                .setHeaderParam("kid", activeSigningKey.keyId())
                .signWith(activeSigningKey.key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return parseToken(token)
                .getBody()
                .getSubject();
    }

    public Date extractExpiration(String token) {
        return parseToken(token)
                .getBody()
                .getExpiration();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Invalid JWT", e);
            return false;
        }
    }

    private Jws<Claims> parseToken(String token) {
        Key verificationKey = resolveKey(token)
                .orElseThrow(() -> new JwtException("Unknown signing key"));
        return Jwts.parserBuilder()
                .setSigningKey(verificationKey)
                .build()
                .parseClaimsJws(token);
    }

    private Optional<Key> resolveKey(String token) {
        return extractKeyId(token).flatMap(jwtKeyService::findVerificationKey);
    }

    private Optional<String> extractKeyId(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return Optional.empty();
            }
            byte[] headerBytes = Decoders.BASE64URL.decode(parts[0]);
            Map<String, Object> header = objectMapper.readValue(headerBytes, MAP_TYPE);
            Object kid = header.get("kid");
            if (kid instanceof String kidValue && !kidValue.isBlank()) {
                return Optional.of(kidValue);
            }
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
