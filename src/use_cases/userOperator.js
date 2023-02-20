import { User } from "../entities/dataContainers.js";
import {IUserRepository} from "./interfaces/iUserRepository.js";


export class UserOperator{
    constructor(world, userRepository) {
        var isIUserRepo = userRepository instanceof IUserRepository;

        if(!isIUserRepo){
            throw new Error("IUserRepository implementation required");
        }

        this.userRepository = userRepository;
        this.world = world;
    }
    
    addUserInRoom(user_data, room_id){
        var user = new User();
        user.fromJSON(user_data);
        this.world.addUserToRoom(user, room_id);
    }

    getUser(user_id) {
        let user = this.world.getUser(user_id);

        return user;
    }

    getUserRoom(user_id) {
        try {
            let user = this.getUser(user_id);

            let room_id = user.room_id;
            return this.world.getRoom(room_id);
        } catch (error) {
            return undefined;
        }
    }

    getAllUsers() {
        return this.world.getAllUsers();
    }

    updateUserTargetPosition(user_id, target_position) {
        let user = this.getUser(user_id);

        user.target_position = target_position;
        user.position = target_position; // OJOO!! IT CAN GENERATE SMALL DESYNC WHEN NEW USER CONNECTED
    }

    removeUserFromRoom(user_id, room_id) {
        this.world.removeUserFromRoom(user_id, room_id);
    }

    removeUserFromWorld(user_id) {
        this.world.removeUser(user_id);
    }

    removeUser(user_id) {
        this.userRepository.removeUserFromWorld(user_id);

        this.userRepository.deleteUser(user_id);
    }

    changeUserRoom(user_id, room_id){
        this.world.changeRoom(user_id, room_id)

        this.userRepository.changeUserRoom(user_id, room_id);
    }
}
