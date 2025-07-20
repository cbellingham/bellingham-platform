# Bellingham DataFutures Backend

This module contains the Spring Boot API used by the platform.

## Configuration

The API requires a secret key for signing JSON Web Tokens. The configuration
files reference the `JWT_SECRET` environment variable which must be provided
when running the application:

```
jwt.secret=${JWT_SECRET:}
```

If no secret is supplied the application will fail to start.

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

- `JWT_SECRET` – secret used for signing tokens.
- `server.port` – optional port the API listens on. Defaults to `8080`.

Start the service with the Maven wrapper:

```bash
./mvnw spring-boot:run
```

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
