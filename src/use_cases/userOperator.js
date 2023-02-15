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
    
    addUserInRoom(user, room_id){
        this.world.addUser(user, room_id);
    }

    removeUser(user_id) {
        this.world.removeUser(user_id);

        this.userRepository.deleteUser(user_id);
    }

    changeUserRoom(user_id, room_id){
        this.world.changeUserRoom(user_id, room_id)

        this.userRepository.changeUserRoom(user_id, room_id);
    }
}