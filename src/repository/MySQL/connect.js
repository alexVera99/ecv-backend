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

    selectAll(table) {
        let query = 'SELECT * FROM ' + table;

        return this.executeQuery(query);
    }
}
