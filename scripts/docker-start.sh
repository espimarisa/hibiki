#!/bin/sh

echo "Starting Hibiki..."

# Starts the instance
docker compose -f "./docker-compose.yml" up -d
echo "Finished starting Hibiki!"
