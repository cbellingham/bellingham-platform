#!/usr/bin/env bash
set -euo pipefail

# Rebuild from a clean state so the target/classes directory always
# contains the compiled entrypoint. This prevents "Could not find or
# load main class com.bellingham.datafutures.BellinghamApplication"
# when the previous build output has been deleted or was never created
# (for example after a fresh clone).
./mvnw -DskipTests clean package

# Run the packaged jar with any provided arguments
exec java -jar target/datafutures-0.0.1-SNAPSHOT.jar "$@"
