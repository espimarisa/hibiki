###########################################################
# Shell script to initialize Hibiki's Docker environment. #
###########################################################

#!/bin/sh
set -e

# Creates external volumes.
docker volume create hibiki-logs
docker volume create hibiki-postgres
docker volume create hibiki-valkey
echo "Docker volumes checked/created."

# Creates the network if it doesn't already exist.
echo "Creating Docker network..."
if ! docker network inspect hibiki-network >/dev/null 2>&1; then
  if docker network create hibiki-network; then
    echo "Network hibiki-network created successfully."
  else
    echo "Failed to create network hibiki-network."
    exit 1
  fi
else
  echo "Network hibiki-network already exists."
fi

echo "Hibiki Docker environment initialized."
exit 0
