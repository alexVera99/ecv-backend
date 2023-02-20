import { WSClientManager } from '../entities/wsClientManager.js';
import { mapToObj } from '../utils/utils.js';


export class WSClientOperator {
    constructor(user_operator, room_operator, animation_operator) {
        this.last_index = 1;
        this.client_manager = new WSClientManager();
        this.user_operator = user_operator;
        this.room_operator = room_operator;
        this.animation_operator = animation_operator;
    }

    updateIndex() {
        this.last_index = this.last_index + 1;
    }

    addClient(connection) {
        var user_id = this.last_index;
        this.client_manager.addClient(connection, user_id);

        this.updateIndex();

        // TEMPORAL: WE NEED TO MAKE A SYSTEM TO MAP USER TOKENS WITH USERS ID
        connection.user_id = user_id;
        // END TEMPORAL

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

    sendUserInitData(user_id) {
        var roomsMap = this.room_operator.getAllRoomsAvailable();
        var animationsMap = this.animation_operator.getAllAnimations();
        const animations = mapToObj(animationsMap);
        const room_data = mapToObj(roomsMap);


        var info = {
            type: "connection",
            data: {
                user_id: user_id,
                rooms_data: room_data,
                animations_data: animations
            }
        };
    
        //connection.send(JSON.stringify(info));
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
}
