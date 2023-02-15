import {IAnimationRepository} from "./interfaces/iAnimationRepository.js";

export class AnimationOperator {
    constructor(world, animationRepository){
        var isAnimationRepo = animationRepository instanceof IAnimationRepository;
        if(!isAnimationRepo){
            throw new Error("IAnimationRepository implementation required");
        }
        this.animationRepository = animationRepository;
        this.world = world;
    }
    
    createAnimation(animation){
        this.addAnimationToWorld(animation);

        this.world.animationRepository.addAnimation(animation);
    }

    addAnimationToWorld(animation){
        this.world.addAnimation(animation)
    }

    getAnimation(id){
        return this.animationRepository.getAnimation(id);
    }

    getAllAnimations(){
        return this.animationRepository.getAnimations();
    }

}
