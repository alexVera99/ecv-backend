# ecv-backend

 Backend for Virtual Communications Subject project at UPF

## Setup the server

First, install node dependencies

``npm install``

Create an environment file by using the `.env.example` file:

``cp .env.example .env``

Yoy may modify the values if needed.

Now, you can start the backend server by executing:

``node src/index.js``

If you want a MySQL database and a server with NodeJS installed, you may use Docker Compose:

``docker compose up -d``

## Usage of the client

On the client side include the library `client.js` and connect using:

```js
my_client.connect( 'localhost:8081', "CHAT");

//this method is called when the server gives the user his ID (ready to start transmiting)
my_client.on_ready = function(id){
  //user has an ID
};

//this method is called when we receive the info about the current state of the room (clients connected)
my_client.on_room_info = function(info){
  //to know which users are inside
};

//this methods receives messages from other users (author_id is an unique identifier per user)
my_client.on_message = function( author_id, msg ){
  //data received
}

//this methods is called when a new user is connected
my_client.on_user_connected = function( user_id ){
  //new user!
}

//this methods is called when a user leaves the room
my_client.on_user_disconnected = function( user_id ){
  //user is gone
}

```

To send a message, you may use:

```js
my_client.sendMessage("my super message");
```

Also, you can obtain the room info by using:

```js
my_client.getRoomInfo("my room", function(room_info) { ... } );
```

## Disclaimer

This code has been inspired in the [SillyServer.js project](https://github.com/jagenjo/SillyServer.js).
