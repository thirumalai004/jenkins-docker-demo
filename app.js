const express = require('express');
const http = require('http');
const os = require('os');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const VERSION = process.env.APP_VERSION || 'v1';
const users = new Map();   // socket.id -> name
const history = [];        // last 50 messages (in memory)

app.use(express.static('public'));
app.get('/health', (req, res) => res.json({ status: 'ok', version: VERSION }));

io.on('connection', (socket) => {
  socket.emit('info', { version: VERSION, host: os.hostname() });
  socket.emit('history', history);

  socket.on('join', (name) => {
    name = String(name || '').trim().slice(0, 20) || 'Guest' + socket.id.slice(0, 4);
    users.set(socket.id, name);
    io.emit('users', [...users.values()]);
    io.emit('system', `${name} joined the chat`);
  });

  socket.on('message', (text) => {
    const name = users.get(socket.id);
    text = String(text || '').trim().slice(0, 500);
    if (!name || !text) return;
    const msg = { name, text, time: Date.now() };
    history.push(msg);
    if (history.length > 50) history.shift();
    io.emit('message', msg);
  });

  socket.on('typing', (isTyping) => {
    const name = users.get(socket.id);
    if (name) socket.broadcast.emit('typing', { name, isTyping });
  });

  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    if (name) {
      io.emit('users', [...users.values()]);
      io.emit('system', `${name} left the chat`);
    }
  });
});

server.listen(3000, () => console.log('Running on 3000'));