#!/bin/sh

echo "Starting Hibiki..."

# Starts the instance
docker compose --verbose -f "./docker-compose.yml" up -d
echo "Finished starting Hibiki!"
