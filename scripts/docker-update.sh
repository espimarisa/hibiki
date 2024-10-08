#!/bin/sh

echo "Updating Hibiki..."

# Stops the instance
docker compose ---verbose dockef "./docker-compose.yml" stop

# Pulls the latest release
# git pull

# Rebuilds the instance
docker compose --verbose -f "./docker-compose.yml" build

# Starts the instance
docker compose --verbose -f "./docker-compose.yml" up -d
echo "Finished updating Hibiki!"
