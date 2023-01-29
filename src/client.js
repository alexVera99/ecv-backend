var my_client = {
    url: "",
    socket: undefined,

    connect: function (url) {
        my_client.socket = new WebSocket("ws://" + url);

        my_client.socket.onmessage = my_client.onMessage;
    },

    sendMessage: function (message) {
      my_client.socket.send(message);
    },

    onMessage: function (message) {
        console.log(message.data);
    }
}