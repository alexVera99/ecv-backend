export class AnimationAdapter {
    id = undefined;
    name = undefined;
    uri = undefined;
    scene_node_id = undefined;

    constructor(id, name, uri, scene_node_id) {
        this.id = id;
        this.name = name;
        this.uri = uri;
        this.scene_node_id = scene_node_id;
    }

    static parse(mySqlRow) {
        const id = mySqlRow["id"];
        const name = mySqlRow["name"];
        const uri = mySqlRow["uri"];
        const scene_node_id = mySqlRow["scene_node_id"];

        const adapter = new AnimationAdapter(
            id,
            name,
            uri,
            scene_node_id
        )

        return adapter;
    }
}
