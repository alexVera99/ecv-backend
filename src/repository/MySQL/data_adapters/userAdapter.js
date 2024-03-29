export class UserAdapter {
    user_id = undefined;
    username = undefined;
    room_id = undefined;
    scene_node_id = undefined;
    password_hash = undefined;
    position = undefined;
    orientation = undefined;
    is_streamer = false;    

    constructor(user_id, username, room_id, 
                password_hash, scene_node_id,
                position, orientation,
                is_streamer) {
        this.user_id = user_id;
        this.username = username;
        this.room_id = room_id;
        this.password_hash = password_hash;
        this.scene_node_id = scene_node_id;
        this.position = position;
        this.orientation = orientation;
        this.is_streamer = is_streamer || this.is_streamer;
    }

    static parseUser(mySqlRow) {
        const user_id = mySqlRow["id"];
        const username = mySqlRow["username"];
        const room_id = mySqlRow["room_id"];
        const scene_node_id = mySqlRow["scene_node_id"];
        const position = JSON.parse(mySqlRow["position"]);
        const orientation = JSON.parse(mySqlRow["orientation"]);
        const is_streamer = JSON.parse(mySqlRow["is_streamer"]);

        return new UserAdapter(
            user_id,
            username,
            room_id,
            undefined,
            scene_node_id,
            position,
            orientation,
            is_streamer
            );
    }

    static parseUserWithPassword(mySqlRow) {
        let userAdapter = this.parseUser(mySqlRow);

        userAdapter.password_hash = mySqlRow["password"];

        return userAdapter;
    }
}
