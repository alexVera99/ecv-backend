import { IUserRepository } from "../../use_cases/interfaces/iUserRepository.js";

export class UserRepository extends IUserRepository {
    getUserById(id) {
        return id;
    }

    getUsers() {
        return "Users :)";
    }

    createUser(user) {
        console.log("User created");
    }

    deleteUser(id) {
        console.log("User deleted");
    }

    updateUser(user) {
        console.log("User updated");
    }

    changeUserRoom(user_id, room_id) {
        console
    }
}