import { IRoomRepository } from "./interfaces/iRoomRepository.js";

export class RoomOperator {
    constructor(world, roomRepository) {
        var isRoomRepo = roomRepository instanceof IRoomRepository;

        if(!isRoomRepo) {
            throw new Error("IRoomRepository implementation required");
        }
        
        this.roomRepository = roomRepository;
        this.world = world;
    }

    getAllUsersInRoom(room_id) {
        var users = this.world.getAllUsersInRoom(room_id);

        return users;
    }

    getRoom(room_id){
        return this.world.getRoom(room_id);
    }
    
    addRoom(room){
        this.world.addRoom(room);
    }

    getAllRoomsAvailable(){
        return this.world.getAllRooms();
    }

    loadRoomsInWorld() {
        this.roomRepository.getRooms().then( r => r.forEach(room => {
            this.world.addRoom(room);
        }));
         
    }

    addStream(id, room_id) {
        const room = this.getRoom(room_id);

        /* if(room.stream_id) {
            console.log("Room " + room_id + " has already a stream in process (" + room.stream_id + ")");
            return false;
        } */
        room.stream_id = id;

        console.log("Added stream ( " + id + " ) to Room " + room_id );

        return true;
    }

    removeStream(room_id){
        const room = this.getRoom(room_id); 

        room.stream_id = null;
    }
}
