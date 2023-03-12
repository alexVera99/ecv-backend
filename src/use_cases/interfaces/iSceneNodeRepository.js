export class ISceneNodeRepository {
    constructor(){
        if(!this.getById) {
            throw new Error("getById() not defined!");
        }
        if(!this.getAll) {
            throw new Error("getAll() not defined!");
        }
        if(!this.create) {
            throw new Error("create() not defined!");
        }
        if(!this.delete) {
            throw new Error("delete() not defined!");
        }
        if(!this.update) {
            throw new Error("update() not defined!");
        }
    }
}
