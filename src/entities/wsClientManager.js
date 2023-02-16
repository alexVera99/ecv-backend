import { WSClient } from "./wsClient.js";

export class WSClientManager {
    constructor() {
        this.my_clients = new Map();
    }

    addClient(connection, user_id) {
        var client = new WSClient(connection, user_id);
        this.my_clients.set(user_id, client);
    }

    removeClient(user_id) {
        this.my_clients.delete(user_id);
    }

    getConnection(user_id) {
        let client = this.my_clients.get(user_id);
        return client.connection;
    }
}
