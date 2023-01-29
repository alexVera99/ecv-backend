var http = require('http');
var server_port = process.env.NODE_SERVER_PORT;
var url = require('url');

var server = http.createServer( function(request, response) {
	console.log("REQUEST: " + request.url );
	var url_info = url.parse( request.url, true ); //all the request info is here
	var pathname = url_info.pathname; //the address
	var params = url_info.query; //the parameters
	response.end("OK!"); //send a response
});

server.listen(server_port, function() {
	console.log("Server ready!" );
});

var WebSocketServer = require('websocket').server;
var wsServer = new WebSocketServer({ // create the server
    httpServer: server //if we already have our HTTPServer in server variable...
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    console.log("NEW WEBSOCKET USER!!!");
    connection.sendUTF("welcome!");
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
		console.log( "NEW MSG: " + message.utf8Data ); // process WebSocket message
        }
    });

    connection.on('close', function(connection) {
	  console.log("USER IS GONE");// close user connection
    });
});
