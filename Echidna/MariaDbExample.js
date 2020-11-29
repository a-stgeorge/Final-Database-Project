const fs = require('fs');
const mariadb = require('mariadb');
//TODO need to have tunnel running for this to work!
//Format will look like: ssh username@shell.mathcs.bethel.edu -L3306:localhost:3306
	//Sign in if you have to
//TODO also need credentials.txt file with username and password on two seperate lines
// in the root directory

function getCredentials(){
	let text = fs.readFileSync("../credentials.txt", "utf-8").toString().split('\n');
	text[0] = text[0].replace(/\s+/g, '');
	text[1] = text[1].replace(/\s+/g, '');
	return text;
}

function createMariaDbConnection() {
	let text = getCredentials();
	return mariadb.createPool({
		host: 'localhost',
		user: text[0],
		password: text[1],
		database: text[0],
		port: 3306
	});
}

async function asyncFunction() {
	let pool = createMariaDbConnection();
	let conn;
	try {
		conn = await pool.getConnection();
		const rows = await conn.query("SELECT * from student");
		console.log(JSON.stringify(rows));
		// const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
		// console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
	} catch (err) {
		throw err;
	} finally {
		if (conn) return conn.end();
	}
}

asyncFunction();