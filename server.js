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
        io.emit("start", { player1: { drawn: false }, player2: { drawn: false } });
        state = "started";
        player1.drawn = false;
        player2.drawn = false;
        console.log("Game started");
      }
      if (state === "started")
        socket.emit("start", {
          player1: { drawn: player1.drawn },
          player2: { drawn: player2.drawn }
        });
    });
  socket.role = role;
  socket.drawn = false;
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
    socket.drawn = true;
    socket.broadcast.emit("draw", { role: socket.role });
  });

  socket.on("cock", function () {
    socket.broadcast.emit("cock", { role: socket.role });
  });

  socket.on("fire", function (data) {
    socket.broadcast.emit("fire", {
      role: socket.role, x: data.x, y: data.y, empty: data.empty
    });
  });

  socket.on("getshot", function (data) {
    socket.broadcast.emit("getshot", { role: data.role });
  });

  socket.on("die", function (data) {
    socket.broadcast.emit("die", { role: data.role });
  });
});
