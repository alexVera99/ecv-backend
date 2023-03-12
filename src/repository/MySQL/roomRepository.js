import { Room } from "../../entities/dataContainers.js";
import { IRoomRepository } from "../../use_cases/interfaces/iRoomRepository.js";

export class RoomRepository extends IRoomRepository {
    constructor(connector) {
        super();
        this.table = "MOONSCAPE_3D_rooms";
        this.connector = connector;
    }

    async getRoomById(id) {
        let query = "SELECT * FROM " + this.table + " WHERE id = ?;";
        let params = [id];
        var res = await this.connector.executeQueryWithParams(query, params);
                       
        let room_data = res[0];
        let room = this.parseRoom(room_data);

        return room;
    }


    async getRooms() {
        let query = "SELECT * FROM " + this.table + ";";
        var res = await this.connector.executeQuery(query);
        
        const rooms = res.map((room_data) => {
            return this.parseRoom(room_data);
        });

        return rooms;
    }

    createRoom(room) {
        var room_name = room.room_name;
        var gltf_uri = room.gltf_uri;
        var scale = room.scale;
        var rSQL = "INSERT INTO " + this.table + 
                    "(name, scale, gltf_uri) VALUES (?, ?, ?);";
        var rParams = [room_name, scale, gltf_uri];
        this.connector.executeQueryWithParams(rSQL, rParams);
    }

    deleteRoom(id) {
        var param = [id];
    
        var sql = "DELETE FROM "+this.table +" WHERE id = ? ";
        this.connector.executeQueryWithParams(sql,param);
    }

    updateRoom(room) {
        var room_id = room.room_id;
    }

    parseRoom(room_data) {
        
        let room_name = room_data["name"];
        let room = new Room(room_name);
        room.room_id = room_data["id"];
        room.scale = room_data["scale"];
        room.gltf_uri = room_data["gltf_uri"];

        return room;

    }
}