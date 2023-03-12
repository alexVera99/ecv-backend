export class ITokenRepository {
    constructor(){
        if(!this.getToken) {
            throw new Error("getToken(user_id) not defined!");
        }
        if(!this.setToken) {
            throw new Error("setToken(token, user_id) not defined!");
        }
        if(!this.deleteToken) {
            throw new Error("deleteToken(token) not defined!");
        }
        if(!this.getUserId) {
            throw new Error("getUserId(token) not defined!");
        }
    }
}
