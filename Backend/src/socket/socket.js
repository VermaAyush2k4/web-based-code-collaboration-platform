const WebSocket = require('ws');
const url = require('url');

const documentRooms = new Map(); // documentId => Set of sockets

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket, req) => {
    const { query } = url.parse(req.url, true);
    const documentId = query.documentId;

    if (!documentId) {
      socket.close(1008, 'Missing document ID');
      return;
    }

    if (!documentRooms.has(documentId)) {
      documentRooms.set(documentId, new Set());
    }

    const clients = documentRooms.get(documentId);
    clients.add(socket);

    console.log(`🔌 WS: New client joined doc ${documentId} (total: ${clients.size})`);

    socket.on('message', (message) => {
      console.log(`[WS] Message received: ${message}`);
      for (const client of clients) {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          console.log(`[WS] Sending to another client`);
          client.send(message);
        }
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
      if (clients.size === 0) {
        documentRooms.delete(documentId);
      }
      console.log(`❌ WS: Client disconnected from doc ${documentId}`);
    });
  });
};

module.exports = { setupWebSocket };
