#####################################################
# Shell script to stop Hibiki's Docker environment. #
#####################################################

#!/bin/sh
set -e

echo "Stopping Hibiki..."

# Stops Hibiki.
if docker compose stop; then
  echo "Hibiki has been stopped."
else
  echo "Failed to stop Hibiki. Check the logs, fool!"
  exit 1
fi

exit 0
