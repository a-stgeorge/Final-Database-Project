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
 *      Add 'NULL' Button next to inputs that can be null
 * - Don't forget Non Instructional loads (add to course page? add to course sections page?)
 * - Refactor errors into showError method? [Allows for error message and auto clear timer]
 * - For page 4: might need to show all instructors teaching a course, not just one
 * - For page 2: when editing some users they have weird TEU values (not intervals of 3.4) the form currently rejects this
 *      Disable step check for TEU values, it should take any value I guess
 * - For page 4: don't need to make a query on change, just use value from dropdown (works fine as is but can clean up)
 */

const server = app.listen(port, function() {
    console.log('Server running on port 3000');
});
