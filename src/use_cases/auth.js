import bcrypt from "bcrypt";
import { IUserRepository } from "./interfaces/iUserRepository.js";
import { User } from "../entities/dataContainers.js";

export class Authorizer {
    constructor(userRepository) {
        var isIUserRepo = userRepository instanceof IUserRepository;

        if(!isIUserRepo){
            throw new Error("IUserRepository implementation required");
        }

        this.userRepository = userRepository;
        this.saltRounds = 10;
    }
    async login(username, password, callback) {
        let user = await this.userRepository.getUserByUsername(username);

        let hash = user.password;

        bcrypt.compare(password, hash, (err, result) => {
            if(!result) {
                return;
            }
            callback();
        });
    }

    signup (username, password, animation_id){
        bcrypt.hash(password, this.saltRounds, (err, hash) => {
            if(err) {
                throw err;
            }
            this.userRepository.createUser(username, hash, animation_id);
        })
    }
}
