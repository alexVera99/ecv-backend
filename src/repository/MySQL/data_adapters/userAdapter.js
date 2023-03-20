export class UserAdapter {
    user_id = undefined;
    username = undefined;
    room_id = undefined;
    scene_node_id = undefined;
    password_hash = undefined;
    position = undefined;

    constructor(user_id, username, room_id, 
                password_hash, scene_node_id,
                position) {
        this.user_id = user_id;
        this.username = username;
        this.room_id = room_id;
        this.password_hash = password_hash;
        this.scene_node_id = scene_node_id;
        this.position = position;
    }

    static parseUser(mySqlRow) {
        const user_id = mySqlRow["id"];
        const username = mySqlRow["username"];
        const room_id = mySqlRow["room_id"];
        const scene_node_id = mySqlRow["scene_node_id"];
        const position = JSON.parse(mySqlRow["position"]);

        return new UserAdapter(
            user_id,
            username,
            room_id,
            undefined,
            scene_node_id,
            position
            );
    }

    static parseUserWithPassword(mySqlRow) {
        let userAdapter = this.parseUser(mySqlRow);

        userAdapter.password_hash = mySqlRow["password"];

        return userAdapter;
    }
}
