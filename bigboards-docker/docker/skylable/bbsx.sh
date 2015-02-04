#!/bin/bash
DAEMON=/etc/init.d/sx
CONFIG_FILE=/etc/sxserver/sxfcgi.conf
SETUP=sxsetup
SETUP_INPUT=/etc/sxserver/sxsetup.conf.in

if [ ! -s "$CONFIG_FILE" ]; then
    echo "The Sx Server has not been configured, trying to auto configure using the ${SETUP_INPUT} file";

    if [ ! -e "${SETUP_INPUT}" ]; then
        echo "Unable to find the auto configuration file (${SETUP_INPUT})"
        exit 3;
    else
        $SETUP --config-file $SETUP_INPUT

        # -- Get the cluster uuid and admin key

        # -- Copy the sxsetup.conf file and add the admin key and cluster uuid
        cp /etc/sxserver/sxsetup.conf /etc/sxserver/sxsetup.conf.nodes

    fi
fi

$DAEMON start

tail -f /var/log/sxserver/sxfcgi.log