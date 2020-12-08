const express = require('express');
const router = require('express').Router();
router.use(express.static('../public'));

const fs = require('fs');
const db = require('../database');
let connection;

async function checkConnection(req, res, next) {
	//This will make sure we have a connection for each request
	try {
		if (!connection) {
			connection = await db.makeMariaDbPool();
		}
	} catch (err) {
		res.status(400).send(`<h1>${err}</h1>
			<p>Perhaps your ssh tunnel is not working (or credentials.txt is the wrong format)</p>`
		);
		next('Tunnel or credentials issue');
	}
	next();
}

router.use(checkConnection);

//TODO note that even these post routes can be extracted further if they get too long, and they can be renamed
//	to something more helpful

const makeQuery = require('../query');

router.post('/timeWarp/:timeWarpNum', async function (req, res) {
	try {
		let timeWarpString = fs.readFileSync(__dirname + `\\..\\timeWarps\\phase${req.params.timeWarpNum}.txt`, 'utf8');
		let answer = await makeQuery(connection, timeWarpString);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page1', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page2', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page3', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page4', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page5', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page6', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

router.post('/page7', async function (req, res) {
	let body = req.body;
	try {
		let answer = await makeQuery(connection, body.query);
		res.status(200).send(answer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});


module.exports = router;