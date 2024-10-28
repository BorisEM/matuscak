const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Nový hráč sa pripojil');
  ws.on('message', (message) => {
    console.log(`Správa prijatá: ${message}`);
    // Posielanie správ všetkým pripojeným klientom
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Hráč sa odpojil');
  });
});

app.get('/', (req, res) => {
  res.send('Server beží.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server beží na porte ${PORT}`);
});
