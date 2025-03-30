###########################
# Stops a Docker instance #
###########################

#!/bin/sh
echo "Stopping Hibiki container..."
docker compose --verbose -f "./compose.yml" stop
echo "Hibiki has been stopped!"
