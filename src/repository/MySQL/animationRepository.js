import { Animation, Animation3D } from "../../entities/dataContainers.js";
import { IAnimationRepository } from "../../use_cases/interfaces/iAnimationRepository.js";
import { AnimationAdapter } from "./data_adapters/animationAdapter.js";

export class AnimationRepository extends IAnimationRepository {
    constructor(connector){
        super();
        this.table = "MOONSCAPE_3D_animations";
        this.connector = connector;
    }
    async getAnimationById(id) {
        let query = "SELECT * FROM " + this.table + " AS anim WHERE anim.id = ?";
        let params = [id];
        var res = await this.connector.executeQueryWithParams(query, params);
                       
        let anim_data = res[0];
        const animation_parsed = this.parseAnimation(anim_data);

        return animation_parsed;
    }

    async getAllBySceneNodeId(scene_node_id) {
        const query = "SELECT * FROM " + this.table +
            " WHERE scene_node_id = ?";
        const params = [scene_node_id];

        const res = await this.connector.executeQueryWithParams(query, params);


        const animationAdapters = res.map(r => {
            return AnimationAdapter.parse(r);
        });

        return animationAdapters;
    }

    async getAnimations() {
        let query = "SELECT * FROM " + this.table;
        var that = this;
        let animations_parsed = []
        var res = await this.connector.executeQuery(query)
        for(var i = 0; i<res.length; i++)
        {
            var anim_parsed = that.parseAnimation(res[i]);
            animations_parsed.push(anim_parsed);
        }
        
        return animations_parsed;
      
    }


    createAnimation(animation, scene_node_id) {
        const name = animation.name;
        const uri = animation.uri;

        var params = [name, uri, scene_node_id];
        var sql = "INSERT INTO " + this.table + " (name, uri, scene_node_id) VALUES (?, ?, ?)";
        return new Promise(resolve => {
            this.connector.executeQueryWithParams(sql, params)
            .then(res => {
                const isAnimCreated = res["affectedRows"] == 1;
                resolve(isAnimCreated);
            })
            .catch(err => {
                console.log(err);
                const isAnimCreated = false;
                resolve(isAnimCreated);
            });
        });
    }

    deleteAnimation(id) {
        var param = [id];
        var sql = "DELETE FROM "+this.table +" WHERE id = ? ";
        this.connector.executeQueryWithParams(sql,param);
    }

    updateAnimation(animation) {
        // TO DO... IF NEEDED...
    }

    parseAnimation(anim_data){
        
        let animation = new Animation3D();
        animation.id = anim_data["id"];
        animation.name = anim_data["name"];
        animation.uri = anim_data["uri"];
        const scene_node_id = anim_data["scene_node_id"];

        return {
            animation: animation,
            scene_node_id: scene_node_id
        };
    }
}