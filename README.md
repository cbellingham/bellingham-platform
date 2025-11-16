# Bellingham Platform

This repository combines the backend API and web client that make up the Bellingham DataFutures application.

## Modules

- **bellingham-datafutures** – Spring Boot API providing the service layer.
- **bellingham-frontend** – React + Vite client interface.

Detailed usage instructions live in each module's README. The sections below outline the basic setup for local development.

## Getting started

Clone the repository and start each module from its directory.

### Backend

Requires Java 17+ and access to a PostgreSQL database.

```bash
cd bellingham-datafutures
./mvnw spring-boot:run
```

To run the API without PostgreSQL (e.g., for controller testing) export
`SPRING_PROFILES_ACTIVE=test` before starting. This reuses the same H2
settings defined in `src/test/resources/application-test.properties` and
auto-creates the schema so you can exercise endpoints without any
external database. Remember to remove the environment variable when you
need to point the service back to PostgreSQL.

### Frontend

```bash
cd bellingham-frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` (see `.env.example`) so the frontend knows where to reach the API.

