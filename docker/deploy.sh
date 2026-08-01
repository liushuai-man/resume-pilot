#!/bin/sh
set -eu

PROJECT_DIR="${PROJECT_DIR:-/root/resume-pilot}"
COMPOSE_FILE="docker-compose.production.yml"

cd "$PROJECT_DIR"

if [ ! -f .env.production ]; then
  echo "ERROR: $PROJECT_DIR/.env.production does not exist" >&2
  exit 1
fi

compose() {
  docker compose --env-file .env.production -f "$COMPOSE_FILE" "$@"
}

# Versions deployed before the uploads path fix wrote imported resumes to the
# container-only /uploads directory. Preserve any files still present before
# replacing that container.
current_backend_id="$(compose ps -q backend 2>/dev/null || true)"
if [ -n "$current_backend_id" ]; then
  echo "Migrating legacy imported files into the persistent uploads volume..."
  docker exec "$current_backend_id" sh -c \
    'if [ -d /uploads ]; then cp -a /uploads/. /app/uploads/; fi'
fi

echo "Pulling application images..."
compose pull backend frontend

echo "Ensuring PostgreSQL and Redis are running..."
compose up -d db redis

echo "Applying Prisma migrations..."
compose run --rm --no-deps backend pnpm prisma migrate deploy

echo "Replacing application containers..."
compose up -d --no-build --remove-orphans backend frontend

echo "Waiting for application health checks..."
attempt=1
while [ "$attempt" -le 18 ]; do
  backend_id="$(compose ps -q backend)"
  frontend_id="$(compose ps -q frontend)"

  if [ -n "$backend_id" ] && [ -n "$frontend_id" ]; then
    backend_health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$backend_id")"
    frontend_health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$frontend_id")"

    echo "Health check $attempt/18: backend=$backend_health frontend=$frontend_health"
    if [ "$backend_health" = "healthy" ] && [ "$frontend_health" = "healthy" ]; then
      compose ps
      echo "Deployment completed successfully."
      exit 0
    fi
  fi

  sleep 10
  attempt=$((attempt + 1))
done

echo "ERROR: application did not become healthy in time" >&2
compose ps >&2
compose logs --since=5m backend frontend >&2
exit 1
