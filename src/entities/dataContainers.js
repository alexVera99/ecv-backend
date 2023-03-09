export class Animation {
    avatar_id;
    image_uri;
    scale;
    facing_right;
    facing_front;
    facing_left;
    facing_back;
    walking_frames;
    idle_frames;
    talking_frames;

    fromJSON(data) {
        this.avatar_id = data["avatar_id"];
        this.image_uri = data["image_uri"];
        this.scale = data["scale"];
        this.facing_right = data["facing_right"];
        this.facing_front = data["facing_front"];
        this.facing_left = data["facing_left"];
        this.facing_back = data["facing_back"];
        this.walking_frames = data["walking_frames"]
        this.idle_frames = data["idle_frames"]
        this.talking_frames = data["talking_frames"]
    }
}

export class User {
    constructor(username) {
        this.user_id = null;
        this.username = username || "";
        this.room_id = null;
        this.avatar = null;
        this.facing = null;
        this.animation = "idle_frames";
        this.position = null;
        this.target_position = null;
    }

    fromJSON(data) {
        this.user_id = data["user_id"];
        this.username = data["username"];
        this.room_id = data["room_id"];
        this.avatar = data["avatar"];
        this.facing = data["avatar"]["facing_front"];
        this.animation = data["animation"];
        this.position = data["position"];
        this.target_position = data["target_position"];
    }
}

export class Room {
    constructor(room_name) {
        this.room_id = null;
        this.room_name = room_name || "";
        this.users = new Map();
        this.scale = null;
        this.gltf_uri = null;
    }

    fromJSON(data) {
        this.room_id = data["room_id"];
        this.room_name = data["room_name"];
        this.users = new Map(Object.entries(data["users"]));
        this.scale = data["scale"]
        this.gltf_uri = data["gltf_uri"];
    }
}
