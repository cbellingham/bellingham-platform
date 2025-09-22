package com.bellingham.datafutures.security;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JwtSigningKeyRepository extends JpaRepository<JwtSigningKey, Long> {

    Optional<JwtSigningKey> findByActiveTrue();

    Optional<JwtSigningKey> findByKeyIdAndRevokedAtIsNull(String keyId);
}
