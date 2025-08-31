# Realtime Tracker

A minimal Node.js + Express + Socket.IO app that tracks client geolocation in real time and displays markers on a Leaflet map.

## Features

- **Realtime updates**: Sends location updates from the browser to the server via Socket.IO and broadcasts to all clients.
- **Live map**: Renders positions on a Leaflet map with OpenStreetMap tiles.
- **Multi-client support**: Each connected client has its own marker; markers are removed on disconnect.

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: EJS, Leaflet, Vanilla JS
- **Views**: `EJS` templating

## Prerequisites

- **Node.js**: v16+ recommended
- **npm**: comes with Node

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the server**
   ```bash
   node app.js
   ```
   - The server listens on `http://localhost:3000`.

3. **Open in browser**
   - Navigate to `http://localhost:3000`.
   - Allow location permissions when prompted by the browser.

## Project Structure

```
Realtime-Tracker/
├─ app.js                 # Express + Socket.IO server
├─ package.json
├─ public/
│  ├─ css/
│  │  └─ style.css        # Basic page styles
│  └─ js/
│     └─ script.js        # Geolocation + Socket.IO client + Leaflet map
├─ views/
│  └─ index.ejs           # Main view with map container
└─ README.md
```

## How It Works

- **Client** (`public/js/script.js`)
  - Uses `navigator.geolocation.watchPosition()` to watch location changes.
  - Emits updates via `socket.emit('send-location', { latitude, longitude, accuracy })`.
  - Renders markers on a Leaflet map and updates them on `receive-location`.

- **Server** (`app.js`)
  - Listens for `send-location` events, then broadcasts to all clients using `io.emit('receive-location', {...})`.
  - On disconnect, emits `user-disconnected` so others can remove that marker.

- **Events**
  - **send-location**: client → server (payload includes `latitude`, `longitude`, optional `accuracy`).
  - **receive-location**: server → all clients to update/create markers.
  - **user-disconnected**: server → all clients to remove a marker by `socket.id`.

## Tips for Better Accuracy

- **Use a secure context**: Browsers provide best geolocation accuracy on secure origins. `http://localhost` is treated as secure; use it for local testing.
- **Allow location services**: Ensure OS/browser location services are enabled. On desktops, enabling Wi‑Fi (even if on Ethernet) can improve accuracy.
- **Indoors vs outdoors**: GPS can be inaccurate indoors; move near a window or outdoors if possible.
- **Multiple tabs**: If multiple tabs are open, you’ll see multiple markers. Consider centering the map only on your own tab’s updates to avoid confusion.

## Common Issues

- **Port already in use (EADDRINUSE)**
  - Another process is using port 3000. Close it or change the port in `app.js`.

- **Wrong location (kilometers off)**
  - Use `http://localhost:3000` instead of a LAN IP.
  - Enable location services and Wi‑Fi.
  - Optionally filter out very coarse fixes (e.g., ignore `accuracy > 1000`).

- **No prompt for location**
  - Check browser permissions and site settings. Clear blocked permissions and reload.

## Scripts

Currently, there’s no `start` script defined. You can add one for convenience:
```json
{
  "scripts": {
    "start": "node app.js"
  }
}
```
Then run:
```bash
npm start
```

## License

ISC

## Acknowledgements

- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)