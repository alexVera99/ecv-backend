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

var rooms = []

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    console.log("NEW WEBSOCKET USER!!!");
    connection.sendUTF("welcome!");

	var url_info = url.parse( request.resourceURL, true ); //all the request info is here
	var params = url_info.query; //the parameters

    // Add new client
    var room = params["room"];
    if (!rooms[room]) { // Create room if does not exist
        rooms[room] = [];
    }
    rooms[room].push(connection); // Add client to the room

    // Add room info to the user
    var client = {
        connection: connection,
        room: room
    };



    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            return;
        }
        
        console.log( "NEW MSG: " + message.utf8Data ); // process WebSocket message

        rooms[client["room"]].forEach(client => {
            if (client === connection) {
                return;
            }
            client.sendUTF(message.utf8Data);
        });
    });

    connection.on('close', function(connection) {
	  console.log("USER IS GONE");// close user connection
    });
});
