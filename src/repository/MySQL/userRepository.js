import { Animation, User } from "../../entities/dataContainers.js";
import { IUserRepository } from "../../use_cases/interfaces/iUserRepository.js";

export class UserRepository extends IUserRepository {
    constructor(connector) {
        super();
        this.table = "MOONSCAPE_users";
        this.anim_table = "MOONSCAPE_animations";
        this.connector = connector;
    }

    async getUserById(id) {
        let query = "SELECT * FROM " + this.table + " AS us, animations AS anim" + 
                    " WHERE us.id = ? AND us.animation_id = anim.id";
        let params = [id];

        let res = await this.connector.executeQueryWithParams(query, params);

        let user_data = res[0];

        let user = this.parseUser(user_data);

        return user;
    }

    async getUsers() {
        let query = "SELECT * FROM " + this.table + 
                    " AS us, animations AS anim WHERE us.animation_id = anim.id";

        let res = await this.connector.executeQuery(query);

        let users = [];
        for(data in res)
        {
            var user = this.parseUser(data);
            users.push(user);
        }
        /*
        let users = map((user) => {
            var user = this.parseUser(user_data);
        });*/


        return users;
    }

    createUser(user) {
        var username = user.username;
        var room_id = user.room_id;
        var animation_id = user.animation.avatar_id;
        var position = 0;
        var values = [username, room_id, animation_id, position];
        var sql = "INSERT INTO " + this.table + " (username, room_id, animation_id, position) VALUES (?, ?, ?, ?)";
        this.connector.query(sql, values);
    }

    deleteUser(id) {
    }

    updateUser(user) {
    }

    changeUserRoom(user_id, room_id) {
        // NO té sentit!!!
    }

    parseUser(user_data) {
        let animation = new Animation();
        animation.avatar_id = user_data["animation_id"];
        animation.image_uri = user_data["image_uri"];
        //animation.show_uri = user_data["show_uri"];
        animation.scale = user_data["scale"];
        animation.walking_frames = JSON.parse(user_data["walking_frames"]);
        animation.idle_frames = JSON.parse(user_data["idle_frames"]);
        animation.talking_frames = JSON.parse(user_data["talking_frames"]);
        animation.facing_right = user_data["facing_right"];
        animation.facing_left = user_data["facing_left"];
        animation.facing_front = user_data["facing_front"];
        animation.facing_back = user_data["facing_back"];

        let user = new User();
        user.user_id = user_data["id"];
        user.username = user_data["username"];
        user.room_id = user_data["room_id"];
        user.avatar = animation;
        user.facing = animation.facing_front;
        user.position = user_data["position"];
        user.target_position = user.position;
        return user;
    }
}