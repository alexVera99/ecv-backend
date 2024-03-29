import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from "./interfaces/iUserRepository.js";
import { ITokenRepository } from "./interfaces/iTokenRepository.js";
import { UserOperator } from "./userOperator.js";
import { mapToObj } from "../utils/utils.js";

export class Authorizer {
    constructor(userRepository, tokenRepository, userOperator) {
        const isIUserRepo = userRepository instanceof IUserRepository;
        const isITokenRepo = tokenRepository instanceof ITokenRepository;

        if(!isIUserRepo){
            throw new Error("IUserRepository implementation required");
        }
        
        if(!isITokenRepo){
            throw new Error("ITokenRepository implementation required");
        }

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.userOperator = userOperator;
        this.saltRounds = 10;
    }

    async login(username, password, callback) {
        try {
            var userAdapter = await this.userRepository.getUserWithPassword(username);
            var user_id = userAdapter.user_id;
            var user = await this.userOperator.getUserFromDB(user_id);
            var hash = userAdapter["password_hash"];
            var isNotHash = !hash;
            
            if(isNotHash) {
                throw new Error("User does not exist");
            }
        } catch (error) {
            console.error(error);
            let err = "User does not exist";
            callback(err);
            return;
        }

        bcrypt.compare(password, hash, async (err, result) => {
            if(err) {
                callback(err);
                console.log("FIRST IF WITH ERR: " + err );
                return;
            }
            if(!result){
                let err = "Wrong password";
                callback(err);
                return;
            }
            let token = uuidv4();
            await this.tokenRepository.setToken(token, user_id);
            
            callback(err, user, token);
        });
    }

    async logout (token, callback) {
        this.tokenRepository.deleteToken(token)
        .then((res) => {
            let message = res["message"];
            let is_token_deleted = res["success"];
            console.log(message);
            callback(is_token_deleted);
        })
    }

    signup (username, password, scene_node_id, room_id, is_streamer, callback){
        bcrypt.hash(password, this.saltRounds, async (err, hash) => {
            if(err) {
                callback(err);
                return;
            }
            const isUserCreated = await this.userRepository.createUser(username, hash, scene_node_id, room_id, is_streamer);

            if(!isUserCreated){
                const error = "User couldn't be created";
                //throw new Error(error);
                callback(error);
                return;
            }
            callback(undefined);
        })
    }

    async getUserIdFromToken(token){
        const user_id = await this.tokenRepository.getUserId(token);
        let noUserId = !user_id;
        if(noUserId) {
            return undefined;
        }
        return user_id;
    }
}
