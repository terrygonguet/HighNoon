const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var player1, player2, state = "paused";

server.listen(80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {

  console.log("A fucker joined : " + socket.id);
  let role = 3;
  if (!player1) {
    player1 = socket;
    role = 1;
  } else if (!player2) {
    player2 = socket;
    role = 2;
  }
  socket.emit(
    "joingame",
    { role },
    () => {
      if (player1 && player2 && state === "paused") {
        io.emit("start");
        state = "started";
        console.log("Game started");
      }
      if (state === "started")
        socket.emit("start");
    });
  socket.role = role;
  console.log("Gave " + socket.id + " a role of " + role);

  socket.on("disconnect", function () {
    console.log("A fucker left : " + socket.id + ", role : " + socket.role);
    if (socket === player1) player1 = null;
    else if (socket === player2) player2 = null;
    socket.broadcast.emit("leftgame", { role: socket.role });
    if (!(player1 && player2) && state === "started") {
      socket.broadcast.emit("pause");
      state = "paused";
      console.log("Game stoped");
    }
  });

  socket.on("handmove", function (handRatio) {
    socket.broadcast.emit("handmove", { role: socket.role, handRatio });
  });

  socket.on("draw", function () {
    socket.broadcast.emit("draw", { role: socket.role });
  });

  socket.on("fire", function () {
    socket.broadcast.emit("fire", { role: socket.role });
  });

  socket.on("getshot", function (data) {
    socket.broadcast.emit("getshot", { role: data.role });
  });

  socket.on("die", function (data) {
    socket.broadcast.emit("die", { role: data.role });
  });
});
