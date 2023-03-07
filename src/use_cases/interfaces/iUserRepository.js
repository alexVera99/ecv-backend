export class IUserRepository {
    constructor(){
        if(!this.getUserById) {
            throw new Error("getUserById() not defined!");
        }
        if(!this.getUsers) {
            throw new Error("getUsers() not defined!");
        }
        if(!this.getUserWithPassword) {
            throw new Error("getUserWithPassword() not defined!");
        }
        if(!this.createUser) {
            throw new Error("createUser() not defined!");
        }
        if(!this.deleteUser) {
            throw new Error("deleteUser() not defined!");
        }
        if(!this.updateUser) {
            throw new Error("updateUser() not defined!");
        }
        if(!this.changeUserRoom) {
            throw new Error("updateUser() not defined!");
        }
    }
}