import { ISceneNodeRepository } from "../../use_cases/interfaces/iSceneNodeRepository.js";
import { SceneNodeAdapter } from "./data_adapters/sceneNodeAdapter.js";

export class SceneNodeRepository extends ISceneNodeRepository {
    constructor(connector) {
        super();
        this.connector = connector;
        this.table = "MOONSCAPE_3D_scene_nodes";
    }

    async create(sceneNodeAdapter) {
        // TO DO
    }

    async update(sceneNodeAdapter) {
        // TO DO
    }

    async getById(id) {
        const res = await this.connector.getById(id, this.table);

        const sceneNodeAdapter = SceneNodeAdapter.parse(res);

        return sceneNodeAdapter;
    }

    async getAll() {
        const res = await this.connector.getAll(this.table);

        const sceneNodeAdapters = res.map(r => {
            return SceneNodeAdapter.parse(r);
        });

        return sceneNodeAdapters;
    }

    async delete(id) {
        const isSceneNodeDeleted = await this.connector.delete(id, this.table);

        return isSceneNodeDeleted;
    }
}
