import { IUserRepository } from "../../use_cases/interfaces/iUserRepository.js";
import { UserAdapter } from "./data_adapters/userAdapter.js";

export class UserRepository extends IUserRepository {
    constructor(connector) {
        super();
        this.table = "MOONSCAPE_3D_users";
        this.connector = connector;
    }

    async getUserById(id) {
        let query = "SELECT * FROM " + this.table + 
                    " WHERE id = ?";
        let params = [id];

        let res = await this.connector.executeQueryWithParams(query, params);

        let user_data = res[0];

        let user_adapter = UserAdapter.parseUser(user_data);

        return user_adapter;
    }

    async getUsers() {
        let query = "SELECT * FROM " + this.table;

        let res = await this.connector.executeQuery(query);

        let user_adapters = [];
        for(data in res)
        {
            var user_adapter = UserAdapter.parseUser(data);
            user_adapters.push(user_adapter);
        }

        return user_adapters;
    }

    async getUserWithPassword(username) {
        let query = "SELECT * FROM " + this.table + 
                    " WHERE username = ?";
        let params = [username];

        let res = await this.connector.executeQueryWithParams(query, params);

        let user_data = res[0];

        let userAdapter = UserAdapter.parseUserWithPassword(user_data);

        return userAdapter;
    }

    async createUser(username, password, scene_node_id, room_id, is_streamer) {
        var values = [username, password, scene_node_id, room_id, is_streamer];
        var sql = "INSERT INTO " + this.table + " (username, password, scene_node_id, room_id, is_streamer) VALUES (?, ?, ?, ?, ?)";
        return new Promise(async (resolve) => {
            this.connector.executeQueryWithParams(sql, values)
            .then(res => {
                const isUserCreated = res["affectedRows"] == 1;
                resolve(isUserCreated);
            })
            .catch(err => {
                console.log(err);
                const isUserCreated = false;
                resolve(isUserCreated);
            });
        });
    }

    deleteUser(id) {
    }

    updateUser(user) {
    }

    changeUserRoom(user_id, room_id) {
        // Ara sí que te sentit! S'ha d'implementar
    }
}
