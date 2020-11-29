const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const path = require('path');
const db = require('./database');
let connection;

async function checkConnection(req, res, next) {
	//This will get us a new db connection every time we visit root page
	try {
		if (!connection) {
			connection = await db.makeMariaDbPool();
		}
	} catch (err) {
		res.send(`<h1>Error: ${err} </h1>`);
	}
	next();
}

app.use(checkConnection);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** TODO LIST:
 * - probably want error handling around making queries (refactor to separate function probably) 
 * 		tied with returning and using good response codes
 * - perhaps extract all routing to different file, ie. all GETs in one place, POST's, etc. 
 */



app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/mainPage.html'));
});

app.get('/page1', async function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/page1.html'));
});

app.get('/page2', async function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/page2.html'));
});

app.post('/page1', async function (req, res) {
	let answer = await connection.query('select * from student');
	res.send(answer);
});

app.post('/page2', async function (req, res) {
	let body = req.body;
	let answer = await connection.query(body.query);
	res.send(answer);
});

const server = app.listen(port, function() {
    console.log('Server running on port 3000');
});
