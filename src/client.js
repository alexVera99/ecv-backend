var my_client = {
    url: "",
    socket: undefined,

    connect: function (url, room) {
        my_client.socket = new WebSocket("ws://" + url + "?room=" + room);

        my_client.socket.onmessage = my_client.onMessage;
    },


    sendMessage: function (message) {
      my_client.socket.send(message);
    },

    onMessage: function (message) {
        /*
        {
            type: "msg",
            data: {
                author_id : 1232,
                msg: "safdsa"
            }
        }

        {
            type: "connection",
            data: {
                author_id: 1234
            }
        }

        {
            type: "room_info",
            data: {
                clients: [1, 2, 3] // Id of clients connected to the room
            }
        }

        {
            type: "connection_new_user",
            data: {
                user_id: 123
            }
        }

        {
            type: "disconnection_user",
            data: {
                user_id: 123
            }
        }
        */
        console.log(message.data);
        var payload = JSON.parse(message.data);
        var type = payload["type"];
        var data = payload["data"];

        if (type == "connection" && my_client.on_ready) {
            var author_id = data["author_id"];
            my_client.on_ready(author_id);
        }

        else if (type == "msg" && my_client.on_message) {
            var author = data["author_id"];
            var msg = data["msg"];
            my_client.on_message(author, msg);
        }

        else if (type == "room_info" && my_client.on_room_info) {
            var info = data["clients"];
            my_client.on_room_info(info);
        }

        else if (type == "connection_new_user" && my_client.on_user_connected) {
            var user_id = data["user_id"];
            my_client.on_user_connected(user_id);
        }

        else if (type == "disconnection_user" && my_client.on_user_disconnected) {
            var user_id = data["user_id"];
            my_client.on_user_disconnected(user_id);
        }
    },

    /* on_message: function(author_id, msg) {
        console.log(author_id, msg);
    } */
}