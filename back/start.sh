#!/bin/bash
export LANGUAGE="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"
export LC_CTYPE="UTF-8,"
export LANG="en_US.UTF-8"

if [ -e $1 ]; then
	echo "mode: prod | dev"
	exit;
fi

export BASKET_MODE=$1
if [ $1 = "dev" ]; then
	echo 'dev mode'
	node server.js
fi

echo 'prod mode'
LOGFILE=/var/log/basketball.log

while [[ 1 ]]; do
	echo "Initializing application" | ts '[%Y-%m-%d %H:%M:%S]' >> $LOGFILE
	sudo -E node server.js | ts '[%Y-%m-%d %H:%M:%S]' >> $LOGFILE
	sleep 1
done

