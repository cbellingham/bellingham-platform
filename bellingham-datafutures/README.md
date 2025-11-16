# Bellingham DataFutures Backend

This module contains the Spring Boot API used by the platform.

## Configuration

The API now sources its JWT signing material from configuration so each
environment can supply its own values and rotate them without a
deployment. Provide the following properties (environment variables
shown in parentheses) for each runtime:

- `jwt.rotation.initial-key-id` (`JWT_INITIAL_KEY_ID`) – Identifier for
  the active signing key. Recommended format is a timestamped string such
  as `2024-05-rotation-a`.
- `jwt.rotation.initial-secret` (`JWT_INITIAL_SECRET`) – Base64-encoded
  256-bit shared secret used to sign new tokens.
- `jwt.expirationMs` – Token lifetime in milliseconds (default
  `86400000`).

On startup the application ensures an active signing key exists in the
`jwt_signing_keys` table, inserting one with the configured ID and secret
if necessary. This seed process only runs when no active key is present,
allowing keys to be managed entirely in the database afterwards.

### Rotation plan

JWT keys are stored in the `jwt_signing_keys` table with active/revoked
status. To rotate keys or revoke outstanding tokens without deploying:

1. **Insert a new key** with a unique `key_id` and secret. You can use
   the `JwtKeyService.rotate` method from an administrative job or run a
   SQL insert/update directly.
2. **Mark the previous key inactive** so newly minted tokens use the new
   secret. The helper service sets the existing active key to inactive
   automatically when `rotate` is called.
3. **Verify traffic**. Tokens signed with the old key remain valid until
   you revoke it, enabling gradual rotation.
4. **Revoke the old key** by setting `revoked_at` and `active = false`
   (the `JwtKeyService.revoke` helper does this). Once revoked, tokens
   signed with that key are rejected immediately, effectively logging out
   holders.

This approach allows operators to update key state via database changes
or scheduled jobs, satisfying the requirement to revoke tokens without
redeploying the service.

## Running the application

The API requires Java 17+ and a PostgreSQL instance. By default the
datasource is configured for a local database named `bdf` using the
credentials `bdf_user`/`bdf_pass` as defined in
`src/main/resources/application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/bdf
spring.datasource.username=bdf_user
spring.datasource.password=bdf_pass
```

The following environment variables can be used to configure the runtime:

- `server.port` – optional port the API listens on. Defaults to `8080`.
- `APP_ADMIN_PASSWORD` – **required** bootstrap credential used to create
  or update the initial administrative account. The value must be at
  least 12 characters and should be unique per deployment. The
  application refuses to start if this value is missing or a common
  default (`admin`, `password`, `changeme`). Operators can alternately
  provide the same value via the Spring property
  `app.bootstrap.admin-password`.

Start the service with the Maven wrapper:

```bash
./mvnw spring-boot:run
```

### Using the in-memory profile

For controller testing or quick manual QA you can run the API against the
same in-memory H2 database that backs the unit tests. Export the `test`
profile before starting the service and Spring Boot will reuse the
settings from `src/test/resources/application-test.properties`:

```bash
export SPRING_PROFILES_ACTIVE=test
./mvnw spring-boot:run
```

This profile auto-creates the schema on startup so no PostgreSQL
instance is required. Be sure to unset the environment variable when you
are ready to point the service back at PostgreSQL.

Or build a runnable jar and execute it manually:

```bash
./mvnw package
java -jar target/datafutures-0.0.1-SNAPSHOT.jar
```

## Running tests

Unit tests use an in-memory H2 database defined in
`src/test/resources/application-test.properties`. Run them with the
`test` Spring profile:

```bash
./mvnw test -Dspring.profiles.active=test
```
