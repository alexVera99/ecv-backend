import { Animation } from "../../entities/dataContainers.js";
import { IAnimationRepository } from "../../use_cases/interfaces/iAnimationRepository.js";

export class AnimationRepository extends IAnimationRepository {
    constructor(){
        super();
        
        this.animationData = {
            avatar_id: 1,
            image_uri: "../imgs/char1.png",
            show_uri: "../imgs/avatar1.png",
            scale: 0,
            walking_frames: [2,3,4,5,6,7,8,9],
            idle_frames: [0],
            talking_frames: [0,1],
            facing_right: 0,
            facing_left: 2,
            facing_front: 1,
            facing_back: 3
            
        };
        this.animation2Data = {
            avatar_id: 2,
            image_uri: "../imgs/char2.png",
            show_uri: "../imgs/avatar2.png",
            scale: 0,
            walking_frames: [2,3,4,5,6,7,8,9],
            idle_frames: [0],
            talking_frames: [0,1],
            facing_right: 0,
            facing_left: 2,
            facing_front: 1,
            facing_back: 3
            
        };
    }
    getAnimationById(id) {
        console.log("Get animation with id " + id);
        return this.animationData;
    }

    getAnimations() {
        return [this.animationData, this.animation2Data];
    }

    createAnimation(animation) {
        var id = animation.avatar_id;
        console.log("Animation with id " + id + " has been created");
    }

    deleteAnimation(id) {
        console.log("Animation with id " + id + " has been deleted");
    }

    updateAnimation(animation) {
        var id = animation.avatar_id;
        console.log("Animation with id" + id + " has been updated");
    }
}