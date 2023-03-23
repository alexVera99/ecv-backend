import { User } from "../../../entities/dataContainers.js";
import { animParserDB } from "./animParserDB.js";

export class UserParseDB {
    static parse(userAdapter, sceneNodeAdapter, materialAdapter, animationAdapterArray) {
        const animations = animParserDB.parseArray(animationAdapterArray);

        const user_data = {
            user_id: userAdapter.user_id,
            username: userAdapter.username,
            room_id: userAdapter.room_id,
            position: userAdapter.position,
            orientation: userAdapter.orientation,
            scene_node: {
                id: sceneNodeAdapter.id,
                mesh_uri: sceneNodeAdapter.mesh_uri,
                scale: sceneNodeAdapter.scale,
                position: sceneNodeAdapter.position,
                material: {
                    id: materialAdapter.id,
                    name: materialAdapter.name,
                    color_texture: materialAdapter.color_texture
                },
                animations: animations
            }
        };

        const user = new User();
        user.fromJSON(user_data);
        return user;
    }
}
