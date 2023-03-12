import { IMaterialRepository } from "../../use_cases/interfaces/iMaterialRepository.js";
import { MaterialAdapter } from "./data_adapters/materialAdapter.js";

export class MaterialRepository extends IMaterialRepository {
    constructor(connector) {
        super();
        this.connector = connector;
        this.table = "MOONSCAPE_3D_materials";
    }

    async create(materialAdapter) {
        // TO DO
    }

    async update(materialAdapter) {
        // TO DO
    }

    async getById(id) {
        const res = await this.connector.getById(id, this.table);

        const materialAdapter = MaterialAdapter.parse(res);

        return materialAdapter;
    }

    async getBySceneNodeId(scene_node_id) {
        const query = "SELECT * FROM " + this.table +
            " WHERE scene_node_id = ?";
        const params = [scene_node_id];

        const res = await this.connector.executeQueryWithParams(query, params);

        const materialAdapter = MaterialAdapter.parse(res[0]);

        return materialAdapter;
    }

    async getAll() {
        const res = await this.connector.getAll(this.table);

        const materialAdapters = res.map(r => {
            return MaterialAdapter.parse(r);
        });

        return materialAdapters;
    }

    async delete(id) {
        const isMatDeleted = await this.connector.delete(id, this.table);

        return isMatDeleted;
    }
}
