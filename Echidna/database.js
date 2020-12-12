const fs = require('fs');
const mariadb = require('mariadb');
const path = require('path');

module.exports = {
    credentials: function getCredentials() {
        let text = fs.readFileSync(path.resolve(__dirname, "../credentials.txt")).toString().split('\n');
        text[0] = text[0].replace(/\s+/g, '');
        text[1] = text[1].replace(/\s+/g, '');
        return text;
    },

    makeMariaDbPool: async function createMariaDbConnection() {
        let text = this.credentials();
        let pool = mariadb.createPool({
            host: 'localhost',
            user: text[0],
            password: text[1],
            database: 'echidna',
            port: 3306,
            multipleStatements: true
        });
        try {
            let conn = await pool.getConnection();
            console.log('Connection to MariaDb made (or re-established)');
            return conn;
        } catch (err) {
            throw err;
        }
    },

    makeQuery: async function makeTestQuery(query) {
        let pool = createMariaDbConnection();
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(query);
            return rows;
        } catch (err) {
            throw err;
        }
    }
}