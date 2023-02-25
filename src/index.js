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
import { TokenRepository } from './repository/MySQL/tokenRepository.js';
import { WSClientOperator } from './use_cases/wsClientOperator.js';
import { Authorizer } from './use_cases/auth.js';
import { MySQLConnector } from './repository/MySQL/connect.js';
import { config } from 'dotenv';
import bodyParser from "body-parser";
import cors from "cors";

config();

var server_port = process.env.NODE_SERVER_PORT || 8081;
const client_url = process.env.CLIENT_URL;
var isDebugMode =  (process.env.APP_DEBUG === "true");

// Expose "public" folder
var app = express();
app.use(express.static('public'));

// Create http server
var server = createServer(app);

server.listen(server_port, function() {
	console.log("Server ready!" );
});

const corsOptions = {
    origin: client_url,
    allowedHeaders: ['Content-Type']
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use( bodyParser.json() ); // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({extended: true}) ); //unicode
//example of a POST request with parameters inside the body from Form
app.all('/signup', function (req, res) {
    let payload = req.body;

    let username = payload["username"];
    let password = String(payload["password"]);
    let animation_id = payload["animation_id"];

    let is_username_not_defined = !username;
    let is_password_not_defined = !password;
    let is_animation_id_not_defined = !animation_id;

    if (is_username_not_defined || is_password_not_defined || is_animation_id_not_defined) {
        let status_code = 400;
        let message = "Error creating user";
        let payload = {
            message: message
        }

        res.status(status_code).send(JSON.stringify(payload));
        return;
    }
    
    let authorizer = new Authorizer(userRepository, tokenRepository);

    let onsignup = (err) => {
        let message;
        let status_code;

        if(err) {
            message = "Error creating user";
            status_code = 400;
        }
        else{
            message = "User created successfully";
            status_code = 201;
        }
        let payload = {
            message: message
        };

        res.status(status_code).send(JSON.stringify(payload));
    }

    authorizer.signup(username, password, animation_id, onsignup);
});

app.all('/login', function (req, res) {
    let payload = req.body;

    let username = payload["username"];
    let password = String(payload["password"]);

    let is_username_not_defined = !username;
    let is_password_not_defined = !password;

    if (is_username_not_defined || is_password_not_defined) {
        let status_code = 400;
        let message = "Missing username or password";
        let payload = {
            message: message
        }

        res.status(status_code).send(JSON.stringify(payload));
        return;
    }

    let authorizer = new Authorizer(userRepository, tokenRepository);

    let onlogin = (err, user, token) => {
        let status_code;
        let payload;

        if(err) {
            console.log(err);

            let message = "Username or password is wrong.";
            status_code = 401;

            payload = {
                message: message
            };
        }
        else{
            let message = "Successfully log in.";
            status_code = 200;
            payload = {
                message: message,
                user: user,
                token: token
            };
        }

        res.status(status_code).send(JSON.stringify(payload));
    }

    authorizer.login(username, password, onlogin);
});

app.all('/logout', function (req, res) {
    let payload = req.body;

    let token = payload["token"];

    let is_not_token = !token;

    if (is_not_token) {
        let status_code = 404;
        let payload = {
            message: "Missing token"
        }

        res.status(status_code).send(JSON.stringify(payload));
        return;
    }

    let authorizer = new Authorizer(userRepository, tokenRepository);

    let onlogout = (is_token_deleted) => {
        let message;
        let status_code;

        if(!is_token_deleted) {
            message = "Couldn't logout.";
            status_code = 400;
        }
        else {
            message = "Successfully logout.";
            status_code = 200;
        }

        let payload = {
            message: message,
        };
        res.status(status_code).send(JSON.stringify(payload));
    }

    authorizer.logout(token, onlogout);
});


var connector = new MySQLConnector();

var world = new World();

// MySQL Repositories
var userRepository = new UserRepository(connector);
var animationRepository = new AnimationRepository(connector);
var roomRepository = new RoomRepository(connector);
let tokenRepository = new TokenRepository(connector);

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
        }else if(pathname == "/login"){
            //get username and password
            //process
                //checked if user is already in world 
                //hash password, check db (get pswr form db and compare)
            //return answer (connect: 200 or wrong credentials: 403)
        }else if(pathname == "/signup"){
            //get username and password
            // check not exist -- return(error)
            //hash pasword
            //add user to db
            //return success 200
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

        else if(msg["type"] == "user_change_room") {
            let user_id = msg["user"].user_id;
            let room_id = msg["room_id"];

            userOperator.changeUserRoom(user_id, room_id);

            wsClientOperator.broadcastPayloadToAll(payload);
            wsClientOperator.sendUsersInRoom(user_id);
        }

        else if(msg["type"] == "user_change_room") {
            let user_id = msg["user"].user_id;
            let room_id = msg["room_id"];

            userOperator.changeUserRoom(user_id, room_id);

            wsClientOperator.broadcastPayloadToAll(payload);
            wsClientOperator.sendUsersInRoom(user_id);
        }

        else if(msg["type"] == "msg") {
            var user_id = connection.user_id;
            wsClientOperator.broadcastPayload(user_id, payload);
        }
    },

    onClose: function (event) {
        var connection = this;
        var user_id = connection.user_id;


        wsClientOperator.removeClient(user_id);

        wsClientOperator.onCloseBroadcast(user_id);
        userOperator.removeUserFromWorld(user_id);

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


        console.log("---------------------------------");
        console.log("---------------------------------");
    }
}

MyServer.init(server);

