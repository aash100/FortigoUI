const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const config = require('./config');
const fs = require('fs');
const compression = require('compression');

const app = express();

const port = 4001;

// compress all responses
app.use(compression());

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
    next();
});

app.use(express.static(__dirname + '/Deployed/Fortigo-app'));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'Deployed/Fortigo-app/index.html'));
});

const options = {
    key: fs.readFileSync('/home/platform/codebase/node/certs/key.pem'),
    cert: fs.readFileSync('/home/platform/codebase/node/certs/cert.pem')
}

const httpsServer = https.createServer(options, app);

httpsServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

