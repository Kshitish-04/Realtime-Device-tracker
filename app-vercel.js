const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store locations in memory (use database in production)
let locations = {};

// Serve main page
app.get('/', (req, res) => {
    res.render("index-vercel");
});

// API to send location
app.post('/api/location', (req, res) => {
    const { id, latitude, longitude } = req.body;
    locations[id] = { latitude, longitude, timestamp: Date.now() };
    res.json({ success: true });
});

// API to get all locations
app.get('/api/locations', (req, res) => {
    // Remove old locations (older than 30 seconds)
    const now = Date.now();
    Object.keys(locations).forEach(id => {
        if (now - locations[id].timestamp > 30000) {
            delete locations[id];
        }
    });
    res.json(locations);
});

// API to remove location
app.delete('/api/location/:id', (req, res) => {
    delete locations[req.params.id];
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;