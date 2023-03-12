export class BaseRepository {
    constructor(connector, table) {
        this.table = table;
        this.connector = connector;

