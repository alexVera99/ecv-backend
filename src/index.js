var http = require('http');
var server_port = process.env.NODE_SERVER_PORT;
var url = require('url');
var WebSocketServer = require('websocket').server;

var server = http.createServer();

server.listen(server_port, function() {
	console.log("Server ready!" );
});

var MyServer = {
    rooms: [],
    defaut_room_name: "default_room",
    clients: [],
    client_id_last: 1,
    server: undefined,
    wsServer: undefined,

    init: function(server) {
        if(!server) {
            throw("You must provide a server!!");
        }

        MyServer.server = server;

        MyServer.server.addListener('request', MyServer.httpHandler.bind(this));

        MyServer.wsServer = new WebSocketServer({
            httpServer: server
        });
        MyServer.wsServer.on('request', MyServer.wsConnectionHandler.bind(this));
    },

    wsConnectionHandler: function(request) {
        var connection = request.accept(null, request.origin);
        
        var room_name = MyServer.getRoomNameFromRequestParams(request);

        var client = MyServer.createNewClient(connection, room_name);
        
        MyServer.sendUserInfo(client);

        MyServer.addClientToRoom(client, room_name);
    
        client.on('message', MyServer.onMessage);
    
        client.on('close', MyServer.onClose);
    },

    httpHandler: function(request, response) {
        console.log("REQUEST: " + request.url );
        var url_info = url.parse( request.url, true ); //all the request info is here
        var pathname = url_info.pathname; //the address
        var params = url_info.query; //the parameters
        response.end("OK!"); //send a response
    },

    // Websocket functions
    createNewClient: function(connection, room_name) {
        /* Add the connection to the clients array and extends
        the fields of the connection so it has user_id and room_name */

        connection.user_id = MyServer.client_id_last
        connection.room_name = room_name;

        MyServer.client_id_last += 1;

        MyServer.clients.push(connection);

        return connection;
    },

    sendUserInfo: function (connection) {
        var info = {
            type: "connection",
            id: connection.user_id
        };
    
        connection.send(JSON.stringify(info));

    },

    getRoomNameFromRequestParams: function(request) {
        var url_info = url.parse( request.resourceURL, true ); //all the request info is here
        var params = url_info.query; //the parameters
        
        // Get room_name from params
        if (params["room"]) {
            var room_name = params["room"];
        }
        else {
            var room_name = MyServer.defaut_room_name;
        }

        return room_name;
    },

    createRoom: function(room_name) {
        var room = {
            room_name: room_name,
            clients: []
        }
        MyServer.rooms[room_name] = room;
    },

    addClientToRoom: function (client, room_name) {
        // Add new client
        if (!MyServer.rooms[room_name]) { // Create room if does not exist
            MyServer.createRoom(room_name);
        }
        MyServer.rooms[room_name].clients.push(client); // Add client to the room
    },

    onMessage: function(message) {
        if (message.type !== 'utf8') {
            return;
        }
        
        console.log( "NEW MSG: " + message.utf8Data ); // process WebSocket message

        // Since it is a callback, this referes to the connection
        var connection = this;
        var room_name = connection.room_name;

        var clients = MyServer.rooms[room_name].clients;

        clients.forEach(client => {
            if (client === connection) {
                return;
            }
            client.sendUTF(message.utf8Data);
        });
    },

    onClose: function(connection) {
        console.log("USER IS GONE");// close user connection
    }
}

MyServer.init(server);
