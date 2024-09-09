const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { startKafkaProducer } = require('./kafkaProducer');
const { startKafkaConsumer } = require('./kafkaConsumer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('audioChunk', async (audioChunk) => {
    await startKafkaProducer(audioChunk);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

startKafkaConsumer(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));