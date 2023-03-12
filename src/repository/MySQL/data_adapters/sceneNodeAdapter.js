export class SceneNodeAdapter {
    id = undefined;
    mesh_uri = undefined;
    scale = undefined;
    position = undefined;

    constructor(id, mesh_uri, scale, position) {
        this.id = id;
        this.mesh_uri = mesh_uri;
        this.scale = scale;
        this.position = position;
    }

    static parse(mySqlRow) {
        const id = mySqlRow["id"];
        const mesh_uri = mySqlRow["mesh_uri"];
        const scale = mySqlRow["scale"];
        const position = mySqlRow["position"];

        const adapter = new SceneNodeAdapter(
            id,
            mesh_uri,
            scale,
            position
        );

        return adapter;
    }
}
