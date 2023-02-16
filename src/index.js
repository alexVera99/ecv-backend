import { createServer } from 'http';
var server_port = 8081;
import { server as WebSocketServer } from 'websocket';
import express from 'express';
import { parse } from 'url';
import { World } from './entities/dataManager.js';
import { UserOperator } from './use_cases/userOperator.js';
import { RoomOperator } from './use_cases/roomOperator.js';
import { AnimationOperator } from './use_cases/animationOperator.js';
import { UserRepository } from './repository/MySQL/userRepository.js';
import { RoomRepository } from './repository/MySQL/roomRepository.js';
import { AnimationRepository } from './repository/MySQL/animationRepository.js';
import { mapToObj } from './utils/utils.js';
var isDebugMode =  (process.env.APP_DEBUG === "true");

// Expose "public" folder
var app = express();
app.use(express.static('public'));

// Create http server
var server = createServer(app);

server.listen(server_port, function() {
	console.log("Server ready!" );
});

var world = new World();

// MySQL Repositories
var userRepository = new UserRepository();
var animationRepository = new AnimationRepository();
var roomRepository = new RoomRepository();

var userOperator = new UserOperator(world, userRepository);
var roomOperator = new RoomOperator(world, roomRepository);
var animationOperator = new AnimationOperator(world, animationRepository);

// Bootstrapping
roomOperator.loadRoomsInWorld();
animationOperator.loadAnimationsInWorld();

var MyServer = {
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
        var url_info = parse( request.url, true ); //all the request info is here
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
        var room_data = roomOperator.getAllRoomsAvailable();
        var animations = animationOperator.getAllAnimations();

        var info = {
            type: "connection",
            data: {
                user_id: connection.user_id,
                rooms_data: room_data,
                animations_data: animations
            }
        };
    
        connection.send(JSON.stringify(info));

    },

    sendUsersInRoom: function(connection) {
        var room_id = connection.room_id;
        var usersMap = roomOperator.getAllUsersInRoom(room_id);

        const users = mapToObj(usersMap);

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

        userOperator.addUserInRoom(user_data, room_id);
    },

    broadcastPayload: function(connection, payload) {
        var room_id = connection.room_id;
        if (!room_id) {
            return;
        }

        var users = roomOperator.getAllUsersInRoom(room_id);

        users.forEach((user, id) => {
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

        var payload = {
            type: "disconnection_user",
            data: {
                user_id: user_id
            }
        }

        // Delete user from room users
        userOperator.removeUserFromRoom(user_id, room_id);

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

