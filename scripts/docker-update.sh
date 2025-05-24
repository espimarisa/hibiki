#######################################################
# Shell script to update Hibiki's Docker environment. #
#######################################################

#!/bin/sh

set -e

# Stops the containers.
echo "Stopping Hibiki containers..."
docker compose down --remove-orphans
echo "Hibiki has been stopped."

# Pull the latest commits.
echo "Pulling latest commits..."
if git pull; then
  echo "Latest commits pulled."
else
  echo "Failed to pull latest commits."
  exit 1
fi

# Builds Hibiki.
echo "Building Hibiki..."
if docker compose build; then
  echo "Hibiki has been updated."
else
  echo "Failed to update Hibiki."
  exit 1
fi

# Starts Hibiki.
if docker compose up -d --remove-orphans; then
  echo "Hibiki has been updated and started successfully."
else
  echo "Failed to start Hibiki."
  exit 1
fi

exit 0
