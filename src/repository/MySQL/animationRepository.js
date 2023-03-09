import { Animation } from "../../entities/dataContainers.js";
import { IAnimationRepository } from "../../use_cases/interfaces/iAnimationRepository.js";

export class AnimationRepository extends IAnimationRepository {
    constructor(connector){
        super();
        this.table = "MOONSCAPE_3D_animations";
        this.connector = connector;

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
    async getAnimationById(id) {
        let query = "SELECT * FROM " + this.table + " AS anim WHERE anim.id = ?";
        let params = [id];
        let animation = null;
        var res = await this.connector.executeQueryWithParams(query, params);
                       
        let anim_data = res[0];
        animation = this.parseAnimation(anim_data);
                        

        return animation;
        //console.log("Get animation with id " + id);
        //return this.animationData;

    }

    async getAnimations() {
        let query = "SELECT * FROM " + this.table;
        var that = this;
        let animations = []
        var res = await this.connector.executeQuery(query)
        for(var i = 0; i<res.length; i++)
        {
            var anim = that.parseAnimation(res[i]);
            animations.push(anim);
        }
        
        return animations;
      
    }


    createAnimation(animation) {
        
        var image_uri = animation.image_uri;
        var show_uri = animation.show_uri;
        var scale = animation.scale;
        var facing_back = animation.facing_back;
        var facing_front = animation.facing_front;
        var facing_left = animation.facing_left;
        var facing_right = animation.facing_right;
        var walking_frames = JSON.stringify(animation.walking_frames);
        var talking_frames = JSON.stringify(animation.talking_frames);
        var idle_frames = JSON.stringify(animation.idle_frames);

        var params = [image_uri, show_uri, scale, facing_right,facing_left, facing_front, facing_back, walking_frames, idle_frames, talking_frames];
        var sql = "INSERT INTO " + this.table + " (image_uri, show_uri, scale, facing_right, facing_left, facing_front, facing_back, walking_frames, idle_frames, talking_frames) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        this.connector.executeQueryWithParams(sql, params);
        //console.log("Animation with id " + id + " has been created");
    }

    deleteAnimation(id) {
        var param = [id];
        var sql = "DELETE FROM "+this.table +" WHERE id = ? ";
        this.connector.executeQueryWithParams(sql,param);
    }

    updateAnimation(animation) {
        var id = animation.avatar_id;
    }

    parseAnimation(anim_data){
        
        let animation = new Animation();
        animation.avatar_id = anim_data["id"];
        animation.image_uri = anim_data["image_uri"];
        animation.show_uri = anim_data["show_uri"];
        animation.scale = anim_data["scale"];
        animation.walking_frames = JSON.parse(anim_data["walking_frames"]);
        animation.idle_frames = JSON.parse(anim_data["idle_frames"]);
        animation.talking_frames = JSON.parse(anim_data["talking_frames"]);
        animation.facing_right = anim_data["facing_right"];
        animation.facing_left = anim_data["facing_left"];
        animation.facing_front = anim_data["facing_front"];
        animation.facing_back = anim_data["facing_back"];

        return animation;

    }
}