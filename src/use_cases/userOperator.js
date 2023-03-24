import { UserParseDB } from "./interfaces/data_adapters/userParserDB.js";
import { IAnimationRepository } from "./interfaces/iAnimationRepository.js";
import { IMaterialRepository } from "./interfaces/iMaterialRepository.js";
import { ISceneNodeRepository } from "./interfaces/iSceneNodeRepository.js";
import {IUserRepository} from "./interfaces/iUserRepository.js";


export class UserOperator{
    constructor(world, userRepository, sceneRepository,
                materialRepository, animationRepository) {
        const isIUserRepo = userRepository instanceof IUserRepository;
        const isISceneNodeRepo = sceneRepository instanceof ISceneNodeRepository;
        const isIMaterialRepo = materialRepository instanceof IMaterialRepository;
        const isIAnimationRepo = animationRepository instanceof IAnimationRepository;

        if(!isIUserRepo){
            throw new Error("IUserRepository implementation required");
        }
        if(!isISceneNodeRepo){
            throw new Error("ISceneNodeRepository implementation required");
        }
        if(!isIMaterialRepo){
            throw new Error("IMaterialRepository implementation required");
        }
        if(!isIAnimationRepo){
            throw new Error("IAnimationRepository implementation required");
        }

        this.userRepository = userRepository;
        this.sceneRepository = sceneRepository;
        this.materialRepository = materialRepository;
        this.animationRepository = animationRepository;
        this.world = world;
    }
    
    async addUserInRoom(user_id){
        const user = await this.getUserFromDB(user_id);
        const room_id = user.room_id;
        this.world.addUserToRoom(user, room_id);
    }

    getUser(user_id) {
        let user = this.world.getUser(user_id);

        return user;
    }

    async getUserFromDB(user_id) {
        const userAdapter = await this.userRepository.getUserById(user_id);
        const scene_node_id = userAdapter.scene_node_id;

        const sceneNodeAdapter = await this.sceneRepository.getById(scene_node_id);
        const materialAdapter = await this.materialRepository.getBySceneNodeId(scene_node_id);
        const animationAdapter = await this.animationRepository.getAllBySceneNodeId(scene_node_id);

        const user = UserParseDB.parse(userAdapter, sceneNodeAdapter, materialAdapter, animationAdapter);

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

    updateUserAttitude(user_id, position, orientation, current_animation) {
        const user = this.getUser(user_id);
        
        // This may happen because the user has been disconnected
        // prior to update its attitude
        if(!user) {
            console.log("Attitude of user with id " + user_id + " could not be updated. User was not found in the world");
            return;
        }

        user.position = position;
        user.orientation = orientation;
        user.current_animation = current_animation;
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
