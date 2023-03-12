import { User } from "../../../entities/dataContainers.js";

export class UserParseDB {
    static parseUserFromDb(userAdapter, sceneNodeAdapter, materialAdapter, animationAdapter) {
        const user_data = {
            user_id: userAdapter.user_id,
            username: userAdapter.username,
            room_id: userAdapter.room_id,
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
                animations: animationAdapter.map(adapter => {
                    return {
                        id: adapter.id,
                        name: adapter.name,
                        uri: adapter.uri
                    };
                })
            }
        };

        const user = new User();
        user.fromJSON(user_data);
        return user;
    }
}