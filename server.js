const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

var app = express();
var server = http.Server(app);
var io  = socketIO(server);

var corsOptions = {
  origin: 'http://localhost:4200'
};

app.use(cors());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var numClients = 0;
var roomNameRegistry = [];

io.on('connection', function (socket) {
  socket.on('roomConnect', function(data) {
    findRoom(data.roomName)
      .then((room) => {
        if (!room) {
          createRoom(data.roomName);
        }
        socket.join(room);
      })
      .catch(err => console.log(err));
  });
  socket.on('roomMessage', function(data) {
    console.log(data.roomName);
    io.to(data.roomName).emit('message', {message: data.message});
  });
});

function findRoom(roomName) {
  return new Promise(function(resolve, reject) {
    let roomIndex = roomNameRegistry.indexOf(roomName);
    if (roomIndex !== -1) {
      return resolve(roomNameRegistry[roomIndex]);
    } else if (roomIndex === -1) {
      return resolve(null);
    } else {
      return reject('Error in finding room.');
    }
  });
}

function createRoom(roomName) {
  console.log('CREATING ROOM: ', roomName);
  roomNameRegistry.push(roomName);
}

server.listen(8080);
