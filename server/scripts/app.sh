#! /bin/bash

CONDITION=$1

case $CONDITION in
"build")
	vite build
	bun ./scripts/setup.js build
	;;
"dev")
	node ./scripts/setup.js sync
	NODE_ENV=development tsx --watch ./src/server.ts
	;;
"start")
	sh scripts/app.sh build
	NODE_ENV=production node ./build/server.js
	;;
"preview")
	sh scripts/app.sh build
	NODE_ENV=preview node ./build/server.js
	;;
*)
	echo "The $CONDITION is unknown"
	;;
esac
