#!/bin/sh

echo "Stopping Hibiki..."
docker compose -f "./docker-compose.yml" stop
echo "Hibiki has been stopped."
