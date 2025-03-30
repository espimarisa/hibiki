#####################################################
# Initialzes a Docker instance for use with Hibiki. #
#####################################################

#!/bin/sh

# Create hibiki-data and hibiki-networks
echo "Creating required volumes and networks..."
docker volume create hibiki-data
docker network create hibiki-network
echo "Completed initial Docker setup!"
