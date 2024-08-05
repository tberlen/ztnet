#!/bin/bash

# Directory to watch
WATCH_DIR="/var/lib/zerotier-one/controller.d/network"

# Command to execute when a change is detected
COMMAND="docker restart zerotier"

# Check if inotifywait is installed
if ! command -v inotifywait &> /dev/null; then
    echo "inotifywait could not be found, please install it."
    exit 1
fi

# Start watching the directory
inotifywait -m -r -e modify,create,delete,move "$WATCH_DIR" |
while read -r directory events filename; do
    echo "Change detected: $events $filename in $directory"
    # Execute the command
    eval "$COMMAND"
done
