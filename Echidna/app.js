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

/** TODO LIST:
 * - In database.js remember to use the 'Echidna' database when ready!
 * - Refactor errors into showError method? [Allows for error message and auto clear timer]
 * - For page 4: don't need to make a query on change, just use value from dropdown (works fine as is but can clean up)
 * - Maybe make dropdowns' text more helpful when its a bunch of numbers (Section: 1, TEU: 2.3, etc)
 */

const server = app.listen(port, function() {
    console.log('Server running on port 3000');
});
