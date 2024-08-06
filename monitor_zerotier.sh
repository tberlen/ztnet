#!/bin/bash

# Path to the directory you want to monitor
WATCHED_DIR="/watched"

# Path to the token file
TOKEN_FILE="/var/lib/zerotier-one/authtoken.secret"

# Get the token
TOKEN=$(cat "$TOKEN_FILE")

inotifywait -m -r -e create,modify --format '%w%f' "$WATCHED_DIR" | while read NEWFILE
do
    # Check if the file has a .json extension
    if [[ "$NEWFILE" == *.json ]]; then
        # Extract the NWID from the directory path
        # Assuming that the NWID is always the parent directory name before /member
        DIRNAME=$(dirname "$NEWFILE")
        NWID=$(basename "$DIRNAME")
        MEMID=$(basename "$NEWFILE" .json)
        
        # Check if the file contains "authorized":true
        if grep -q '"authorized":true' "$NEWFILE"; then
            # Make the API call
            curl -X POST "http://zerotier:9993/controller/network/${NWID}/member/${MEMID}" \
                -H "X-ZT1-AUTH: ${TOKEN}" \
                -d '{"authorized": true}'
            echo "Authorized ${MEMID} in network ${NWID}"
        else
            echo "File ${NEWFILE} does not contain \"authorized\":true, skipping."
        fi
    fi
done
