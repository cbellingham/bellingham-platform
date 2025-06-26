# Bellingham DataFutures Backend

This module contains the Spring Boot API used by the platform.

## Configuration

The API requires a secret key for signing JSON Web Tokens. Provide the key via
`jwt.secret` in `application.properties` or set an environment variable named
`JWT_SECRET` when running the application.

```
jwt.secret=your-strong-secret
```

If the property is missing the application will fail to start.
