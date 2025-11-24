#!/usr/bin/env bash
set -euo pipefail

# Compile and package the application (skipping tests by default)
./mvnw -DskipTests package

# Run the packaged jar with any provided arguments
exec java -jar target/datafutures-0.0.1-SNAPSHOT.jar "$@"
