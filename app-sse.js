const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let locations = {};
let clients = [];

app.get('/', (req, res) => {
    res.render("index-sse");
});

// SSE endpoint for real-time updates
app.get('/api/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    clients.push(res);
    
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// Broadcast to all clients
function broadcast(data) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

app.post('/api/location', (req, res) => {
    const { id, latitude, longitude } = req.body;
    locations[id] = { latitude, longitude, timestamp: Date.now() };
    broadcast({ type: 'location', id, latitude, longitude });
    res.json({ success: true });
});

app.delete('/api/location/:id', (req, res) => {
    delete locations[req.params.id];
    broadcast({ type: 'disconnect', id: req.params.id });
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;