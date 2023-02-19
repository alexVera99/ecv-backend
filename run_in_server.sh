# Script useful to execute the backend using nodemon 
# on the remote server

nohup node_modules/nodemon/bin/nodemon.js `pwd`/src/index.js </dev/null &
