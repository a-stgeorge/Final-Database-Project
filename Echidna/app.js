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
 * - For data forms, how should we handle values that can be null? Accept empty form or force NULL entry?
 * - Don't forget Non Instructional loads (add to course sections page?)
 * - Refactor errors into showError method? [Allows for error message and auto clear timer]
 * - For page 4: might need to show all instructors teaching a course, not just one
 */

const server = app.listen(port, function() {
    console.log('Server running on port 3000');
});
