import mysql from 'mysql';

/* client.query('USE prueba');
client.query(
  'INSERT INTO usuario SET nombre = ?, password = ?',
  ['carlosro_ec', 'miclave'] //important, avoids SQL-injects
); */


export class MySQLConnector {
    connect() {
        let client = mysql.createConnection({
            database: process.env.DB_DATABASE,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST
        });

        return client;
    }

    executeQuery(query) {
        var client = this.connect();

        return new Promise((resolve, reject) => {
            client.query(query, (err, results) => {
                if (err) {
                    reject(err);
                }

                resolve(results);

                client.end();
            });
        })
    }

    executeQueryWithParams(query, params) {
        var client = this.connect();

        return new Promise((resolve, reject) => {
            client.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                }

                resolve(results);

                client.end();
            });
        })
    }

    async getById(id, table) {
        const query = "SELECT * FROM " + table +
            " WHERE id = ?";
        const params = [id];

        const res = await this.executeQueryWithParams(query, params);

        return res[0];
    }

    async getAll(table) {
        const query = "SELECT * FROM " + table;

        const res = await this.executeQuery(query);

        return res;
    }

    async delete(id, table) {
        const query = "DELETE FROM " + table + " WHERE id = ?";
        const params = [id];

        return new Promise((resolve) => {
            this.executeQueryWithParams(query, params)
                .then((res) => {
                    const isItemDeleted = res["affectedRows"] >= 1;
                    resolve(isItemDeleted);
                })
                .catch((err) => {
                    const m = "Error on deleting item with id " + id +
                        " from table " + table + ". Database error : "
                        + err;

                    console.log(m);

                    const isItemDeleted = false;
                    resolve(isItemDeleted);
                });
        })
    }
}
