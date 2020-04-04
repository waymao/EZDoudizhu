const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const uuid = require('uuid');
const WebSocket = require('ws');
const port = 5080;
const development = true;

const app = express();
const map = new Map();
app.user_map = map;

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});

//
// Serve static files from the 'public' folder.
//
if (development) {
    app.use('/ws_test', express.static('ws_test'));
}

app.use(express.static('public'));
app.use(sessionParser);

app.post('/login', (req, res) => {
    //
    // "Log in" user and set userId to session.
    //
    if (req.session.userId !== undefined) {
        res.send({result:'OK', message: 'Already logged in"'});
        return;
    }

    const id = uuid.v4();

    console.log(`Updating session for user ${id}`);
    req.session.userId = id;
    res.send({ result: 'OK', message: 'Session updated'});
});


app.delete('/logout', (request, response) => {
    const ws = map.get(request.session.userId);

    console.log('Destroying session');
    request.session.destroy(() => {
        if (ws) ws.close();

        response.send({ result: 'OK', message: 'Session destroyed' });
    });
});


//
// Create HTTP server by ourselves.
//
const server = http.createServer(app);

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', (request, socket, head) => {
    console.log('Parsing session from request...');

    sessionParser(request, {}, () => {
        if (!request.session.userId) {
            console.log(request.session.userId);
            console.log("session is destroyed");
            socket.destroy();
            return;
        }

        console.log(`Session is parsed for ${request.session.userId}!`);

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });
});


wss.on('connection', (ws, request) => {
    const userId = request.session.userId;

    map.set(userId, ws);

    ws.on('message', (message) => {
        //
        // Here we can now use session parameters.
        //
        console.log(`Received message ${message} from user ${userId}`);
    });

    ws.on('close', () => {
        map.delete(userId);
    });
});

//
// Start the server.
//
server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
