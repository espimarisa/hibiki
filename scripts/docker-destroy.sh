########################################################
# Shell script to destroy Hibiki's docker environment. #
########################################################

#!/bin/sh
set -e

# Prompts for confirmation.
echo "!!! WARNING !!!"
echo "By typing 'CONFIRM DESTROY',"
echo "You confirm that you would like to destroy ALL Hibiki Docker data."
echo "This includes all associated containers, external volumes, and external networks."
echo "This action is IRREVERSIBLE."
echo "Please ensure any important data is backed up before proceeding."
echo ""
echo "Type 'CONFIRM DESTROY' and press Enter to proceed, or anything else to cancel:"

read -r confirmation

if [ "$confirmation" = "CONFIRM DESTROY" ]; then
  echo "Confirmation received. Destroying Hibiki Docker environment..."

  # Removes containers.
  echo "Stopping and removing Docker Compose services..."
  docker compose down --remove-orphans --volumes

  # Removes volumes.
  echo "Removing Docker volumes..."
  docker volume rm --force hibiki-logs || echo "Volume hibiki-logs not found or removal failed."
  docker volume rm --force hibiki-postgres || echo "Volume hibiki-postgres not found or removal failed."
  docker volume rm --force hibiki-valkey || echo "Volume hibiki-valkey not found or removal failed."

  # Removes network.
  echo "Removing Docker network..."
  docker network rm hibiki-network || echo "Network hibiki-network not found or removal failed."
  echo "Successfully destroyed the Hibiki Docker environment. :("
else
  echo "Aborted destroying Hibiki Docker environment."
  exit 1
fi

exit 0
