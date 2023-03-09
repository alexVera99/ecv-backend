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
        let animation = null;
        var res = await this.connector.executeQueryWithParams(query, params);
                       
        let room_data = res[0];
        let room = this.parseAnimation(room_data);
                        

        return room;
    }


    async getRooms() {
        let query = "SELECT * FROM " + this.table + ";";
        var that = this;
        let rooms = []
        var res = await this.connector.executeQuery(query)
        for(var i = 0; i<res.length; i++)
        {
            let queryExits = "SELECT * FROM MOONSCAPE_3D_exits WHERE room_id = " + res[i]["id"]+ ";";
            var params = [res[i]["id"]];
            var resExits = await this.connector.executeQuery(queryExits, params);
            var room = that.parseRoom(res[i], resExits);
            rooms.push(room);
        }
        return rooms;
    }

    createRoom(room) {
        var room_name = room.room_name;
        var image_uri = room.image_uri;
        var scale = room.scale;
        var offset = room.offset;
        var range = JSON.stringify(room.range);
        var rSQL = "INSERT INTO " + this.table + 
                    "(room_name, image_uri, scale, offset) VALUES (?, ?, ?, ?);";
        var rParams = [room_name, image_uri, scale, offset];
        this.connector.executeQueryWithParams(rSQL, rParams);

        var exits = room.exits;
        exits.forEach(e => {
            var sql = "INSERT INTO exits (room_id, position, width, height, to_room_id) VALUES (?, ?, ?, ?, ?);";
            var params = [room.room_id, JSON.stringify(e.position), e.height, e.width, e.to_room_id];
            this.connector.executeQueryWithParams(sql, params);
        });
        

    }

    deleteRoom(id) {
        var param = [id];
    
        var sql = "DELETE FROM "+this.table +" WHERE id = ? ";
        this.connector.executeQueryWithParams(sql,param);
    }

    updateRoom(room) {
        var room_id = room.room_id;
    }

    parseRoom(room_data, exits) {
        
        let room_name = room_data["name"];
        let room = new Room(room_name);
        room.exits = [];
        exits.forEach( (e) => {
            var exit = {
                position:JSON.parse(e["position"]),
                height:e["height"],
                width:e["width"],
                to_room_id:e["to_room_id"]
            }
            room.exits.push(exit);
        });
        room.room_id = room_data["id"];
        room.scale = room_data["scale"];
        room.image_uri = room_data["image_uri"];
        room.offset = room_data["offset"];
        room.range = JSON.parse(room_data["range"]);

        return room;

    }
}