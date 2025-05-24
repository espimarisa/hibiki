###########################################
# Shell script to start Hibiki in Docker. #
###########################################

#!/bin/sh
set -e

echo "Starting Hibiki..."

# Starts Hibiki.
if docker compose up -d --remove-orphans; then
  echo "Hibiki has started successfully."
  echo "View logs with docker compose logs -f hibiki"
else
  echo "Failed to start Hibiki. Check the logs, fool!"
  exit 1
fi

exit 0
