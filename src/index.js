var http = require('http');
var server_port = 8081;
var url = require('url');
var WebSocketServer = require('websocket').server;
var express = require('express');

// Expose "public" folder
var app = express();
app.use(express.static('public'));

// Create http server
var server = http.createServer(app);

server.listen(server_port, function() {
	console.log("Server ready!" );
});

// MOCK DATA
var room1Data = {
    room_id: 0,
    scale: 2.5,
    room_name: "street1",
    users: [],
    image_uri: "../imgs/bg1.png",
    offset: 0,
    range: [-200, 200],
    exits: [
        {
            position: [364, 125],
            height:41,
            width:24,
            to_room_id: 1
        }
    ]
};

var room2Data = {
    room_id:1,
    scale: 2.05,
    room_name:"street2",
    users: [],
    image_uri: "../imgs/city.png",
    offset: 0,
    range: [-300, 300],
    exits: [
        {
            position:[518, 164],
            height: 35,
            width: 20,
            to_room_id:0
        }
    ]

};

var mocked_rooms = [];
mocked_rooms[room1Data.room_id] = room1Data;
mocked_rooms[room2Data.room_id] = room2Data;
console.log(mocked_rooms);

var animationData = {
    id: 0,
    image_uri: "../imgs/spritesheet.png",
    scale: 0,
    walking_frames: [2,3,4,5,6,7,8,9],
    idle_frames: [0],
    talking_frames: [0,1],
    facing_right: 0,
    facing_left: 2,
    facing_front: 1,
    facing_back: 3
    
};
var animation2Data = {
    id: 1,
    image_uri: "../imgs/char2.png",
    scale: 0,
    walking_frames: [2,3,4,5,6,7,8,9],
    idle_frames: [0],
    talking_frames: [0,1],
    facing_right: 0,
    facing_left: 2,
    facing_front: 1,
    facing_back: 3
    
};

var mocked_animations = [];
mocked_animations[animationData.id] = animationData;
mocked_animations[animation2Data.id] = animation2Data;

// END MOCK DATA

var MyServer = {
    rooms: mocked_rooms, // This data should come from database
    animations: mocked_animations, // This data should come from database
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

        var client = MyServer.createNewClient(connection);
        
        MyServer.sendUserInfo(client);

        //MyServer.addClientToRoom(client, room_name); 

        //MyServer.broadcastOnNewUserConnected(client);
    
        client.on('message', MyServer.onMessage);
    
        client.on('close', MyServer.onClose);
    },

    httpHandler: function(request, response) {
        console.log("REQUEST: " + request.url );
        var url_info = url.parse( request.url, true ); //all the request info is here
        var pathname = url_info.pathname; //the address
        var params = url_info.query; //the parameters
        
        if (pathname == "/room") {
            var room_name = params["room"];
            var payload = MyServer.getRoomInfo(room_name);

            var status_code = payload === null ? 404 : 200;
            
            MyServer.sendHTTPResponse(response, status_code, payload);
            return;
        }

        if (pathname == "/") {
            response.end("Welcome :)"); //send a response
        }

    },

    sendHTTPResponse: function (response, status_code, data) {
        //allow cors
        response.writeHead(status_code, { 'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*" });

        if (status_code == 404) {
            response.write(JSON.stringify({
                message: "Not found"
            }));
            response.end();
            return;
        }

        if (typeof(data) == "object")
            response.write(JSON.stringify(data));
        else
            response.write(data);
        response.end();
    },

    // Websocket functions
    createNewClient: function(connection) {
        /* Add the connection to the clients array and extends
        the fields of the connection so it has user_id and room_name */

        connection.user_id = MyServer.client_id_last

        MyServer.client_id_last += 1;

        MyServer.clients[connection.user_id] = connection;

        return connection;
    },

    sendUserInfo: function (connection) {
        var info = {
            type: "connection",
            data: {
                user_id: connection.user_id,
                rooms_data: MyServer.rooms,
                animations_data: MyServer.animations
            }
        };
    
        connection.send(JSON.stringify(info));

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

    broadcastPayload: function(connection, payload) {
        var room_name = connection.room_name;
        var user_ids = MyServer.rooms[room_name].users;

        user_ids.forEach(user_id => {
            var client = MyServer.clients[user_id];
            if (client === connection) {
                return;
            }
            client.sendUTF(JSON.stringify(payload));
        });
    },
    //podem ajuntar amb la anterior
    broadcastPayloadToClient: function(connection, payload, clients) {
        var room_name = connection.room_name;
        
        clients.forEach(client => {
            client.sendUTF(JSON.stringify(payload));
        });
    },
    
    broadcastOnNewUserConnected: function (connection) {
        var payload = {
            type: "connection_new_user",
            data: {
                user_id: connection.user_id
            }
        };

        MyServer.broadcastPayload(connection, payload);
    },

    onMessage: function(message) {
       
        if (message.type !== 'utf8') {
            return;
        }
        var msg = message.utf8Data
        console.log( "NEW MSG: " + msg ); // process WebSocket message

        // Since it is a callback, this referes to the connection
        var connection = this;

        // Create payload
        var payload = {
            type: "msg",
            data: {
                author_id: connection.user_id,
                msg: msg
            }
        };

        if(msg.private){
            var target_ids = msg.target_ids;
            delete payload.data.msg.target_ids;
            delete payload.data.msg.private;
            MyServer.broadcastPayloadToClient(connection, payload, target_ids);

        }

        MyServer.broadcastPayload(connection, payload);
    },

    onClose: function (event) {
        var connection = this;
        var user_id = connection.user_id;

        console.log("USER " + user_id + " IS GONE");

        var payload = {
            type: "disconnection_user",
            data: {
                user_id: user_id
            }
        }

        MyServer.broadcastPayload(connection, payload);
    },

    // HTTP requests functions
    getRoomInfo: function (room_name) {
        // Find room
        var room = MyServer.rooms[room_name]
        if (!room) {
            var room_info = {
                type: "room_info",
                data: "Not found"
            }
            return null;
        }
        var clients = room.clients;

        var client_ids = clients.map((client) => {
            return client.user_id;
        });

        var room_info = {
            type: "room_info",
            data: {
                clients: client_ids // Id of clients connected to the room
            }
        }

        return room_info;
    }
}

MyServer.init(server);
