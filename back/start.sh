#!/bin/bash
### BEGIN INIT INFO
# Provides:          basketmsk
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start daemon at boot time
# Description:       Basket backend server
### END INIT INFO

start() {
	echo 'Starting service'
	LOGFILE=/var/log/basketball.log
	cd /opt/basketmsk/

	while [[ 1 ]]; do
		echo "Initializing application" | ts '[%Y-%m-%d %H:%M:%S]' >> $LOGFILE
		BASKET_MODE=prod /usr/local/bin/node /opt/basketmsk/server.js | ts '[%Y-%m-%d %H:%M:%S]' &>> $LOGFILE
		sleep 1
	done
}

notimpl() {
       echo "not implemented"
}

### main logic ###
case "$1" in
  start)
        start &
        ;;
  stop)
        notimpl
        ;;
  status)
        ;;
  restart|reload|condrestart)
        notimpl
        ;;
  *)
        echo $"Usage: $0 {start|stop|restart|reload|status}"
        exit 1
esac
exit 0
