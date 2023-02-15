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
        return this.world.getAllUsersInRoom(room_id);
    }

    getRoom(room_id){
        return this.world.getRoom(room_id);
    }
    
    addRoom(room){
        this.world.addRoom(room);

        this.roomRepository.addRoom(room);
    }

    getAllRoomsAvailable(){
        return this.roomRepository.getRooms();
    }
}
