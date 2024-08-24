#!/bin/sh

echo "Stopping Hibiki..."
docker compose --verbose -f "./docker-compose.yml" stop
echo "Hibiki has been stopped."
