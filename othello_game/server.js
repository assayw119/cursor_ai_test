// Minimal WebSocket relay server for Othello multiplayer
// Usage: node server.js (after npm i)

const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = new Map(); // roomId -> { clients: Map<clientId, ws>, meta: Map<clientId, {name, role}> }
let nextClientId = 1;

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: new Map(), meta: new Map() });
  }
  return rooms.get(roomId);
}

function broadcast(roomId, data, exceptId = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const [cid, ws] of room.clients.entries()) {
    if (ws.readyState === WebSocket.OPEN && cid !== exceptId) {
      ws.send(JSON.stringify(data));
    }
  }
}

function listParticipants(room) {
  const players = [];
  const spectators = [];
  for (const [cid, info] of room.meta.entries()) {
    const entry = { id: cid, name: info.name, role: info.role };
    if (info.role === 'player1' || info.role === 'player2') players.push(entry);
    else spectators.push(entry);
  }
  return { players, spectators };
}

wss.on('connection', (ws) => {
  const clientId = String(nextClientId++);
  let joinedRoomId = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch {
      return;
    }
    const type = msg.type;

    if (type === 'join') {
      const roomId = String(msg.roomId || 'default');
      const name = String(msg.name || `Player-${clientId}`);
      const wantSpectator = msg.mode === 'spectator';
      const room = getRoom(roomId);

      // Assign role
      let role = 'spectator';
      const currentPlayers = [...room.meta.values()].filter(v => v.role === 'player1' || v.role === 'player2');
      if (!wantSpectator) {
        if (!currentPlayers.find(p => p.role === 'player1')) role = 'player1';
        else if (!currentPlayers.find(p => p.role === 'player2')) role = 'player2';
      }

      room.clients.set(clientId, ws);
      room.meta.set(clientId, { name, role });
      joinedRoomId = roomId;

      const payload = {
        type: 'joined',
        roomId,
        clientId,
        role,
        ...listParticipants(room)
      };
      ws.send(JSON.stringify(payload));
      broadcast(roomId, { type: 'presence', ...listParticipants(room) }, clientId);

      // If 2 players ready
      const playerCount = [...room.meta.values()].filter(v => v.role === 'player1' || v.role === 'player2').length;
      if (playerCount === 2) {
        broadcast(roomId, { type: 'ready' });
      }
      return;
    }

    if (!joinedRoomId) return;

    // Relay specific messages with sender
    const relayTypes = new Set(['move', 'pass', 'new_game', 'state', 'chat']);
    if (relayTypes.has(type)) {
      msg.senderId = clientId;
      broadcast(joinedRoomId, msg, null);
    }
  });

  ws.on('close', () => {
    if (!joinedRoomId) return;
    const room = rooms.get(joinedRoomId);
    if (!room) return;
    const info = room.meta.get(clientId);
    room.clients.delete(clientId);
    room.meta.delete(clientId);
    broadcast(joinedRoomId, { type: 'opponent_left', id: clientId, role: info?.role }, null);
    // Cleanup empty rooms
    if (room.clients.size === 0) rooms.delete(joinedRoomId);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});
