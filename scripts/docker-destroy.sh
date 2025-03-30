##############################
# Destroys a Docker instance #
#############################

#!/bin/sh
echo "!!! WARNING !!!"
echo "By typing "CONFIRM DESTROY", you confirm that you would like to destroy all Hibiki docker data."
echo "This includes volumes (including data), containers, and networks."

# Prompt for input
read confirmation

if [ "$confirmation" == "CONFIRM DESTROY" ]; then
	echo "Confirmed, destroying :("
	docker compose rm --stop --force --volumes
	docker volume rm --force hibiki-data
	docker network rm --force hibiki-network
else
	echo "Cancelled destroying :)"
	exit
fi

exit
