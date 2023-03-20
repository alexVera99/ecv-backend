export class SceneNodeAdapter {
    id = undefined;
    mesh_uri = undefined;
    scale = undefined;

    constructor(id, mesh_uri, scale) {
        this.id = id;
        this.mesh_uri = mesh_uri;
        this.scale = scale;
    }

    static parse(mySqlRow) {
        const id = mySqlRow["id"];
        const mesh_uri = mySqlRow["mesh_uri"];
        const scale = mySqlRow["scale"];

        const adapter = new SceneNodeAdapter(
            id,
            mesh_uri,
            scale,
        );

        return adapter;
    }
}
