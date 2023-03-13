export class World{
    constructor() {
        this.users = new Map();
        this.rooms = new Map();
    }

    getUser(user_id){
        return this.users.get(user_id);
    }

    getAllUsersInRoom(room_id) {
        return this.rooms.get(room_id).users;
    }

    getAllUsers() {
        return this.users;
    }

    getRoom(room_id){
        return this.rooms.get(room_id);
    }

    getAllRooms(){
        return this.rooms;
    }

    addUserToRoom(user, room_id){
        var user_id = user.user_id;

        user.room_id = room_id;

        this.users.set(user_id, user); // A user in users map is always in a room!!!

        this.rooms.get(room_id).users.set(user_id, user);
    }

    addRoom(room){
        console.log("adding room:" + typeof(room));
        this.rooms.set(room.room_id, room);
        console.log("rooms in world: " + this.rooms.get(1));
    }

    changeRoom(user_id, room_id){
        var user = this.getUser(user_id);
        
        this.removeUserFromRoom(user_id, user.room_id);
        
        this.addUserToRoom(user, room_id);
    }

    removeUserFromRoom(user_id, room_id) {
        var room = this.getRoom(room_id);

        room.users.delete(user_id);
    }

    removeUser(user_id) {
        var user = this.getUser(user_id);
        
        var notUserCreated = !user;
        if (notUserCreated) {
            return;
        }
        var room_id = user.room_id;
        // Delete from users list
        this.users.delete(user_id)
        // Delete from users list of the room
        if(room_id) {
            this.rooms.get(room_id).users.delete(user_id);
        }
    }

}
