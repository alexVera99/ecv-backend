import { Room } from "../../entities/dataContainers.js";
import { IRoomRepository } from "../../use_cases/interfaces/iRoomRepository.js";

export class RoomRepository extends IRoomRepository {
    constructor() {
        super();

        this.room1Data = {
            room_id: 1,
            scale: 2.5,
            room_name: "street1",
            users: new Map(),
            image_uri: "../imgs/bg1.png",
            offset: 0,
            range: [-200, 200],
            exits: [
                {
                    position: [364, 125],
                    height:41,
                    width:24,
                    to_room_id: 2
                }
            ]
        };
        
        this.room2Data = {
            room_id:2,
            scale: 2.05,
            room_name:"street2",
            users: new Map(),
            image_uri: "../imgs/city.png",
            offset: 0,
            range: [-300, 300],
            exits: [
                {
                    position:[518, 164],
                    height: 35,
                    width: 20,
                    to_room_id:1
                }
            ]
        
        };
    }

    getRoomById(id) {
        return this.room1Data;
    }

    getRooms() {
        return [this.room1Data, this.room2Data];
    }

    createRoom(room) {
        var room_id = room.room_id;
        console.log("Room with id: " + room_id + " has been created.");
    }

    deleteRoom(id) {
        console.log("Room with id: " + id + " has been created.");
    }

    updateRoom(room) {
        var room_id = room.room_id;
        console.log("Room with id: " + room_id + " has been updated.");
    }
}