import { WSClientManager } from '../entities/wsClientManager.js';
import { mapToObj } from '../utils/utils.js';


export class WSClientOperator {
    constructor(user_operator, room_operator, animation_operator) {
        this.client_manager = new WSClientManager();
        this.user_operator = user_operator;
        this.room_operator = room_operator;
        this.animation_operator = animation_operator;
    }


    addClient(connection, user_id) {
        connection.user_id = user_id;
        this.client_manager.addClient(connection, user_id);
    }

    getUserIdFromClient(connection) {
        const user_id = connection.user_id;

        return user_id;
    }

    getAllClients() {
        return this.client_manager.my_clients;
    }

    removeClient(user_id) {
        this.client_manager.removeClient(user_id);
    }

    sendMessageToClient(user_id, message) {
        const connection = this.client_manager.getConnection(user_id);

        if(message instanceof Object) {
            message = JSON.stringify(message);
        }

        connection.sendUTF(message);
    }

    sendConnectionSuccess(connection) {
        let payload = {
            "type": "connection",
        }
        connection.sendUTF(JSON.stringify(payload));
    }

    async sendUserInitData(user_id) {
        const roomsMap = this.room_operator.getAllRoomsAvailable();
        const room_data = mapToObj(roomsMap);
        const user_data = this.user_operator.getUser(user_id);
        const usersMap = this.user_operator.getAllUsers();
        const users_data = mapToObj(usersMap);

        var info = {
            type: "init_data",
            data: {
                user_id: user_id,
                user: user_data,
                rooms_data: room_data,
                users_data: users_data
            }
        };
    
        this.sendMessageToClient(user_id, info);
    }

    sendUsersInRoom(user_id) {
        let room = this.user_operator.getUserRoom(user_id);

        var usersMap = room.users;

        const users = mapToObj(usersMap);

        var paylaod = {
            type: "room_info",
            data: {
                users: users
            }
        };
    
        //connection.send(JSON.stringify(paylaod));
        this.sendMessageToClient(user_id, paylaod);
    }

    broadcastPayload(user_id, payload) {
        let room = this.user_operator.getUserRoom(user_id);
        if (!room) {
            return;
        }

        var users = room.users;

        users.forEach((user, id) => {
            if (id == user_id) {
                return;
            }
            //connection.sendUTF(JSON.stringify(payload));
            this.sendMessageToClient(id, payload);
        });
    }

    broadcastPayloadFromServer(payload) {
        const users = this.user_operator.getAllUsers();

        users.forEach((user, id) => {
            this.sendMessageToClient(id, payload);
        });
    }

    broadcastPayloadToClients(user_ids, payload) {
        user_ids.forEach((user_id) => {
            this.sendMessageToClient(user_id, payload)
        });
    }

    broadcastPayloadToAll(payload) {
        let users = this.user_operator.getAllUsers();

        users.forEach((user) => {
            let id = user.user_id;

            this.sendMessageToClient(id, payload);
        })
    }

    broadcastOnNewUserConnected(user_id, user_data) {
        var payload = {
            type: "connection_new_user",
            data: {
                user_data: user_data
            }
        };

        this.broadcastPayload(user_id, payload);
    }

    onCloseBroadcast(user_id) {
        this.client_manager.removeClient(user_id);

        var payload = {
            type: "disconnection_user",
            data: {
                user_id: user_id
            }
        }

        this.broadcastPayload(user_id, payload);

        console.log("USER " + user_id + " IS GONE");
    }

    requestUsersAttitude() {
        /* It requests users position, orientation and animation */
        const payload = {
            type: "request_user_attitude",
        }

        this.broadcastPayloadFromServer(payload);
    }
}
