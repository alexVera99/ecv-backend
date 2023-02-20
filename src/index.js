import { createServer } from 'http';
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
import { WSClientOperator } from './use_cases/wsClientOperator.js';
import { config } from 'dotenv';

config();

var server_port = process.env.NODE_SERVER_PORT || 8081;
var isDebugMode =  (process.env.APP_DEBUG === "true");

// Expose "public" folder
var app = express();
app.use(express.static('public'));

// Create http server
var server = createServer(app);

server.listen(server_port, function() {
	console.log("Server ready!" );
});


// TRYINNNG DATABASE!!!!!!!!!!!!!!!!!!!
import { MySQLConnector } from './repository/MySQL/connect.js';
import { User } from './entities/dataContainers.js';

var connector = new MySQLConnector();
/* var res = await connector.selectAll("users");
console.log(res); */

let table = "users";
let id = 1;

let query = "SELECT * FROM " + table + " AS us, animations AS anim" + 
" WHERE us.id = ? AND us.animation_id = anim.id";
let params = [id];

var res = await connector.executeQueryWithParams(query, params);

console.log(res);

var user_data = res[0];

var user = new User();
user.user_id = user_data["id"];
user.username = user_data["username"];
user.room_id = user_data["room_id"];
user.position = user_data["position"];

console.log(user);
// END TRYINNNG DATABASE!!!!!!!!!!!!!!!!!!!

//var connector = new MySQLConnector();


var world = new World();

// MySQL Repositories
var userRepository = new UserRepository(connector);
var animationRepository = new AnimationRepository(connector);
var roomRepository = new RoomRepository(connector);

// Data operators
var userOperator = new UserOperator(world, userRepository);
var roomOperator = new RoomOperator(world, roomRepository);
var animationOperator = new AnimationOperator(world, animationRepository);

var wsClientOperator = new WSClientOperator(userOperator, roomOperator, animationOperator);

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

        let user_id = wsClientOperator.addClient(connection);
        
        wsClientOperator.sendUserInitData(user_id,world);

        connection.on('message', MyServer.onMessage);
    
        connection.on('close', MyServer.onClose);
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
            wsClientOperator.broadcastPayloadToClients(target_ids, payload);
            return;
        } 

        else if(msg["type"] == "user_connect_room") {
            var user_data = msg["user_data"];
            var user_id = user_data.user_id;
            var room_id = user_data["room_id"];
            connection.room_id = room_id;

            userOperator.addUserInRoom(user_data, room_id);

            wsClientOperator.broadcastOnNewUserConnected(user_id, user_data);
            wsClientOperator.sendUsersInRoom(user_id);

            return;
        }

        else if(msg["type"] == "user_update_position") {
            var user_id = msg["user_id"];
            var target_position = msg["target_position"];

            // Update user position in our registry
            userOperator.updateUserTargetPosition(user_id, target_position);
            wsClientOperator.broadcastPayload(user_id, payload)
            return;
        }

        else {
            var user_id = connection.user_id;
            wsClientOperator.broadcastPayload(user_id, payload);
        }
    },

    onClose: function (event) {
        var connection = this;
        var user_id = connection.user_id;
        var room = userOperator.getUserRoom(user_id);

        if(room) {
            var room_id = room.room_id;
            userOperator.removeUserFromRoom(user_id, room_id);
        }

        wsClientOperator.onCloseBroadcast(user_id);
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
        var rooms =     roomOperator.getAllRoomsAvailable();
        var clients = wsClientOperator.getAllClients();
        var num_clients = clients.size;

        console.log("\n\n\n\n\n");
        console.log("---------------------------------");
        console.log("--------------DEBUG--------------")
        console.log("Num of websocket clients ", num_clients);

        rooms.forEach((room, id) => {
            var room_id = id;
            var users = room.users;
            console.log(room);
            var num_users = users.size;

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

        console.log(animationOperator.getAllAnimations());

        console.log("---------------------------------");
        console.log("---------------------------------");
    }
}

MyServer.init(server);

