const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const path = require('path');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/getPage', require('./routes/getPage'));
app.use('/action', require('./routes/action'));

app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/mainPage.html'));
});


const server = app.listen(port, function () {
    console.log('Server running on port 3000');
});
