############################
# Starts a Docker instance #
############################

#!/bin/sh
echo "Starting Hibiki container..."
docker compose --verbose -f "./compose.yml" up -d
echo "Hibiki has been started!"
