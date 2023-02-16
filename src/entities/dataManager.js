export class World{
    constructor() {
        this.users = new Map();
        this.rooms = new Map();
        this.animations = new Map();
    }

    getUser(user_id){
        return this.users.get(user_id);
    }

    getAllUsersInRoom(room_id) {
        return this.rooms.get(room_id).users;
    }

    getRoom(room_id){
        return this.rooms.get(room_id);
    }

    getAnimation(id){
        return this.animations.get(id);
    }
    
    addUser(user){
        var user_id = user.user_id;

        this.users.set(user_id, user);
    }

    addUserToRoom(user, room_id){
        var user_id = user.user_id;

        this.rooms.get(room_id).users.set(user_id, user);
    }

    addRoom(room){
        this.rooms.set(room.room_id, room);
    }

    addAnimation(animation){
        this.animations.set(animation.avatar_id, animation);
    }

    changeRoom(user_id, room_id){
        var room = this.getRoom(room_id);
        var user = this.getUser(user_id);
        
        room.users.delete(user_id);
        
        user.room_id = room_id;

        var new_room = this.getRoom(room_id);
        new_room.users.set(this.currentUserId, user);
    }

    removeUser(user_id) {
        var user = this.getUser(user_id);
        var room_id = user.room_id;
        // Delete from users list
        this.users.delete(user_id)
        // Delete from users list of the room
        this.rooms.get(room_id).users.delete(user_id);
    }

}
