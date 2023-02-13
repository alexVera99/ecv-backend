var http = require('http');
var server_port = 8081;
var url = require('url');
var WebSocketServer = require('websocket').server;
var express = require('express');
var isDebugMode =  (process.env.APP_DEBUG === "true");

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
    room_id: 1,
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
            to_room_id: 2
        }
    ]
};

var room2Data = {
    room_id:2,
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
            to_room_id:1
        }
    ]

};

var mocked_rooms = [];
mocked_rooms[room1Data.room_id] = room1Data;
mocked_rooms[room2Data.room_id] = room2Data;

var animationData = {
    avatar_id: 1,
    image_uri: "../imgs/char1.png",
    show_uri: "./imgs/avatar1.png",
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
    avatar_id: 2,
    image_uri: "../imgs/char2.png",
    show_uri: "./imgs/avatar2.png",
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
mocked_animations[animationData.avatar_id] = animationData;
mocked_animations[animation2Data.avatar_id] = animation2Data;

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

        // Debugging mode
        if(isDebugMode){
            setInterval(MyServer.usersConnectedAndRooms.bind(MyServer), 5000);
            console.log("DEBUG MODE ON!!!!!!!!!");
        }
    },

    wsConnectionHandler: function(request) {
        var connection = request.accept(null, request.origin);

        var client = MyServer.createNewClient(connection);
        
        MyServer.sendUserInfo(client);

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

    sendUsersInRoom: function(connection) {
        var room_id = connection.room_id;
        var users = MyServer.rooms[room_id].users;

        var paylaod = {
            type: "room_info",
            data: {
                users: users
            }
        };
    
        connection.send(JSON.stringify(paylaod));
    },

    /* createRoom: function(room_name) {
        var room = {
            room_name: room_name,
            clients: []
        }
        MyServer.rooms[room_name] = room;
    }, */

    addClientToRoom: function (client, room_id, user_data) {
        // Add room_id to client
        client.room_id = room_id;

        MyServer.rooms[room_id].users[user_data.user_id] = user_data; // Add user information to the room
    },

    broadcastPayload: function(connection, payload) {
        var room_id = connection.room_id;
        if (!room_id) {
            return;
        }

        var users = MyServer.rooms[room_id].users;

        users.forEach(user => {
            var client = MyServer.clients[user.user_id];
            if (!client || client === connection) {
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
    
    broadcastOnNewUserConnected: function (connection, user_data) {
        var payload = {
            type: "connection_new_user",
            data: {
                user_data: user_data
            }
        };

        MyServer.broadcastPayload(connection, payload);
    },

    onMessage: function(message) {
       
        if (message.type !== 'utf8') {
            return;
        }
        var msg = JSON.parse(message.utf8Data, true);

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
            return;
        }

        if(msg["type"] == "user_connect_room") {
            var user_data = msg["user_data"];
            var room_id = user_data["room_id"];
            connection.room_id = room_id;
            MyServer.addClientToRoom(connection, room_id, user_data);
            MyServer.broadcastOnNewUserConnected(connection, user_data);
            MyServer.sendUsersInRoom(connection);
            return;
        }

        if(msg["type"] == "on_user_update_position") {
            var user_id = msg["user_id"];
            var target_position = msg["target_position"];

            // Update user position in our registry
            var room_id = connection.room_id;
            var user = MyServer.rooms[room_id].users[user_id];
            console.log(user.target_position);
            user.target_position = target_position;
            console.log(user.target_position);

            MyServer.broadcastPayload(connection, payload);
            return;
        }

        MyServer.broadcastPayload(connection, payload);
    },

    onClose: function (event) {
        var connection = this;
        var user_id = connection.user_id;
        var room_id = connection.room_id;

        console.log("USER " + user_id + " IS GONE");


        // Delete from clients
        MyServer.clients.splice(user_id, 1);

        if(!room_id) { // If no room id, don't do anything else
            return;
        }

        var room = MyServer.rooms[room_id];

        var payload = {
            type: "disconnection_user",
            data: {
                user_id: user_id
            }
        }

        // Delete user from room users
        room.users.splice(user_id, 1);

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
    },

    // Debug
    usersConnectedAndRooms: function() {
        var counterFunction = function(accumalator, elem) {
            var elemIsNull = !elem;
            if(elemIsNull){
                return accumalator;
            }
            return accumalator + 1;
        }
        var rooms = MyServer.rooms;
        var clients = MyServer.clients;
        var num_clients = clients.length == 0 ? 
                          0 : 
                          clients.reduce(counterFunction, 0);

        console.log("\n\n\n\n\n");
        console.log("---------------------------------");
        console.log("--------------DEBUG--------------")
        console.log("Num of websocket clients ", num_clients);

        rooms.forEach((room) => {
            var room_id = room.room_id;
            var users = room.users;
            var num_users = users.length == 0 ? 
                            0 : 
                            users.reduce(counterFunction, 0);

            console.log("------------------");
            console.log("ROOM ", room_id);
            console.log("Num of users connected: ", num_users);
            users.forEach((user) => {
                console.log("-------");
                console.log("User id:", user.user_id);
                console.log("User name:", user.username);
                console.log("-------");

            })
            console.log("------------------");
            
        })

        console.log("---------------------------------");
        console.log("---------------------------------");
    }
}

MyServer.init(server);

