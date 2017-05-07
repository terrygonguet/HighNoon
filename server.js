const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var rooms = {};

server.listen(80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

function leaveRoom (socket, room) {
  let r = rooms[room];
  socket.leave(room);
  if (r) {
    if (r.player1 == socket) r.player1 = null;
    else if (r.player2 == socket) r.player2 = null;

    if (r.state === "started" && (!r.player1 || !r.player2)) {
      r.state = "paused";
      r.countdown = 3;
      io.to(room).emit("pause");
    }
  }
}

io.on('connection', function (socket) {

  console.log("A fucker joined : " + socket.id);

  socket.role = 0;
  socket.drawn = false;
  socket.room = socket.id;

  socket.on("joinroom", function (data) {

    if (socket.room !== socket.id) {
      leaveRoom(socket, socket.room);
    }
    socket.join(data.room);
    console.log(socket.id + " joined room " + data.room);
    socket.room    = data.room;
    socket.drawn   = false;
    socket.isDead  = false;
    socket.ready   = false;
    socket.score   = 0;
    if (rooms[data.room]) {

      let role = 3;
      if (!rooms[data.room].player1) {
        rooms[data.room].player1 = socket;
        role = 1;
      } else if (!rooms[data.room].player2) {
        rooms[data.room].player2 = socket;
        role = 2;
      }
      socket.role = role;

    } else {

      rooms[data.room] = {
        player1: socket,
        player2: null,
        state: "paused",
        countdown: 3,
        timeoutID: null
      };
      socket.role = 1;

    }

    socket.emit(
      "joingame",
      { role: socket.role },
      () => {
        const room = rooms[socket.room];
        if (room.state === "started") {
          socket.emit("start", {
            player1: { drawn: room.player1.drawn },
            player2: { drawn: room.player2.drawn },
            countdown: room.countdown
          });
        }
      }
    );
    console.log("Gave " + socket.id + " a role of " + socket.role + " in room " + data.room);
  });

  socket.on("disconnect", function () {
    console.log("A fucker left : " + socket.id + ", room : " + socket.room);
    leaveRoom(socket, socket.room);
  });

  socket.on("handmove", function (handRatio) {
    socket.broadcast.to(socket.room).emit("handmove", { role: socket.role, handRatio });
  });

  socket.on("draw", function () {
    socket.drawn = true;
    socket.broadcast.to(socket.room).emit("draw", { role: socket.role });
  });

  socket.on("cock", function () {
    socket.broadcast.to(socket.room).emit("cock", { role: socket.role });
  });

  socket.on("fumble", function () {
    socket.broadcast.to(socket.room).emit("fumble", { role: socket.role });
  });

  socket.on("fire", function (data) {
    socket.broadcast.to(socket.room).emit("fire", {
      role: socket.role, x: data.x, y: data.y, empty: data.empty
    });
  });

  socket.on("getshot", function (data) {
    socket.broadcast.to(socket.room).emit("getshot", { role: data.role });
  });

  socket.on("die", function (data) {
    socket.broadcast.to(socket.room).emit("die", { role: data.role });
    const room = rooms[socket.room];
    room["player" + data.role].isDead = true;

    let id = room.timeoutID;
    if (id) clearTimeout(id)
    room.timeoutID = setTimeout(function () {
      let win = 0;
      if (!room.player1.isDead ||
          !room.player2.isDead)
      {
        if (room.player1.isDead) {
          room.player2.score++;
          win = 2;
        }
        else {
          room.player1.score++;
          win = 1;
        }
      }
      io.to(socket.room).emit("roundend", {
        win,
        player1: room.player1.score,
        player2: room.player2.score
      });
      room.timeoutID = null;
    }, 1000);
  });

  socket.on("ready", function (data) {
    const room = rooms[socket.room];
    room["player" + socket.role].ready = true;
    if (room.player1.ready && room.player2.ready) {
      room.player1.ready  = false;
      room.player2.ready  = false;
      room.player1.isDead = false;
      room.player2.isDead = false;
      room.player1.drawn  = false;
      room.player2.drawn  = false;
      room.state = "started";
      room.countdown = 3;
      io.to(socket.room).emit("start", {
        player1: { drawn: false },
        player2: { drawn: false },
        countdown: 3
      });
      let cdInt = setInterval(() => {
        room.countdown--;
        io.to(socket.room).emit("countdown", { countdown:room.countdown });
        if (room.countdown <= 0) clearInterval(cdInt);
      }, 1000);
      console.log("Game started in room " + socket.room);
    }
  });
});
