#!/bin/sh

echo "Updating Hibiki..."

# Stops the instance
docker compose -f "./docker-compose.yml" stop

# Pulls the latest release
git pull

# Rebuilds the instance
docker compose -f "./docker-compose.yml" build

# Starts the instance
docker compose -f "./docker-compose.yml" up -d
echo "Finished updating Hibiki!"
