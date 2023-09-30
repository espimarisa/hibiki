#!/bin/sh
echo "!!! WARNING !!!"
echo "By typing yes, you confirm that you would like to destroy all Hibiki docker containers."

# Prompt for input
read confirmation

if [ "$confirmation" == "yes" ]; then
  echo "Confirmed"
  docker compose rm --stop --force --volumes
else
  echo "Cancelled"
  exit
fi
