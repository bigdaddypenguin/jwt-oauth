const express = require('express');
const jwt = require('jsonwebtoken');
const jsforce = require('jsforce');
const fs = require('fs');
require('dotenv').config({ path: 'variables.env' });

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files from public folder

const { SF_LOGIN_URL, SF_CONSUMER_KEY, SF_USERNAME } = process.env;
const privateKey = fs.readFileSync('C:\Windows\System32\private.key', 'utf8');

// Home route only renders the page with the button
app.get('/', (req, res) => {
    res.render('index', { message: 'Click the button to connect to Salesforce.' });
});

// Route to handle Salesforce JWT authentication
app.get('/authenticate', (req, res) => {
    const token = jwt.sign({
        iss: SF_CONSUMER_KEY,
        sub: SF_USERNAME,
        aud: SF_LOGIN_URL,
        exp: Math.floor(Date.now() / 1000) + (3 * 60) // Valid for 3 minutes
    }, privateKey, { algorithm: 'RS256' });

    const conn = new jsforce.Connection({
        oauth2: {
            loginUrl: SF_LOGIN_URL,
            clientId: SF_CONSUMER_KEY
        }
    });

    conn.initialize({
        instanceUrl: SF_LOGIN_URL,
        accessToken: token
    });

    conn.identity((err, response) => {
        if (err) {
            res.render('index', { message: 'Failed to connect to Salesforce:', error: err });
        } else {
            res.render('index', { message: 'Connected to Salesforce:', response: JSON.stringify(response, null, 2) });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
