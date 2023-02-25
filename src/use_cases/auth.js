import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from "./interfaces/iUserRepository.js";
import { ITokenRepository } from "./interfaces/iTokenRepository.js";

export class Authorizer {
    constructor(userRepository, tokenRepository) {
        var isIUserRepo = userRepository instanceof IUserRepository;
        var isITokenRepo = tokenRepository instanceof ITokenRepository;

        if(!isIUserRepo){
            throw new Error("IUserRepository implementation required");
        }
        
        if(!isITokenRepo){
            throw new Error("ITokenRepository implementation required");
        }

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.saltRounds = 10;
    }

    async login(username, password, callback) {
        let user_with_password = await this.userRepository.getUserWithPassword(username);
        let user = user_with_password["user"];
        let hash = user_with_password["password"];
        let isNotHash = !hash;

        if(isNotHash) {
            let err = "User does not exist";
            callback(err);
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
            await this.tokenRepository.setToken(token, user.user_id);
            
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

    signup (username, password, animation_id, callback){
        bcrypt.hash(password, this.saltRounds, (err, hash) => {
            if(err) {
                callback(err);
            }
            this.userRepository.createUser(username, hash, animation_id);
            callback(m);
        })
    }
}
