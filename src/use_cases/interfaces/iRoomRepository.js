export class IRoomRepository {
    constructor(){
        if(!this.getRoomById) {
            throw new Error("getRoomById() not defined!");
        }
        if(!this.getRooms) {
            throw new Error("getRooms() not defined!");
        }
        if(!this.createRoom) {
            throw new Error("createRoom() not defined!");
        }
        if(!this.deleteRoom) {
            throw new Error("deleteRoom() not defined!");
        }
        if(!this.updateRoom) {
            throw new Error("updateRoom() not defined!");
        }
    }
}