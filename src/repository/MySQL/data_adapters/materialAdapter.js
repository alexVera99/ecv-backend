export class MaterialAdapter {
    id = undefined;
    name = undefined;
    color_texture = undefined;
    scene_node_id = undefined;

    constructor(id, name, color_texture, 
                scene_node_id) {
        this.id = id;
        this.name = name;
        this.color_texture = color_texture;
        this.scene_node_id = scene_node_id;
    }

    static parse(mySqlRow) {
        const id = mySqlRow["id"];
        const name = mySqlRow["name"];
        const color_texture = mySqlRow["color_texture_uri"];
        const scene_node_id = mySqlRow["scene_node_id"];

        return new MaterialAdapter(
            id,
            name,
            color_texture,
            scene_node_id
            );
    }
}
