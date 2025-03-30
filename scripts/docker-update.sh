#############################
# Updates a Docker instance #
#############################

#!/bin/sh

# Stop the container
docker compose --verbose -f "./compose.yml" stop

# Pull latest commits
git pull

# Build and run
docker compose --verbose -f "./compose.yml" build
docker compose --verbose -f "./compose.yml" up -d
echo "Finished updating Hibiki!"
