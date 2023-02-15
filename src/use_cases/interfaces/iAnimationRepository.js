export class IAnimationRepository {
    constructor(){
        if(!this.getAnimationById) {
            throw new Error("getAnimationById() not defined!");
        }
        if(!this.getAnimations) {
            throw new Error("getAnimations() not defined!");
        }
        if(!this.createAnimation) {
            throw new Error("createAnimation() not defined!");
        }
        if(!this.deleteAnimation) {
            throw new Error("deleteAnimation() not defined!");
        }
        if(!this.updateAnimation) {
            throw new Error("updateAnimation() not defined!");
        }
    }
}
