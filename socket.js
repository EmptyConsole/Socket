const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

let players = {};  // <- GLOBAL PLAYER LIST

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Create new player
  players[socket.id] = { x: 800, y: 800, angle: 0 };

  // Send full list to newcomer
  socket.emit("initialState", players);

  // Tell everyone else about new player
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    x: players[socket.id].x,
    y: players[socket.id].y,
    angle: 0
  });

  // Receive movement updates
  socket.on("updateData", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].angle = data.angle;

      // Send only this player's update to others
      socket.broadcast.emit("update", {
        id: socket.id,
        x: data.x,
        y: data.y,
        angle: data.angle
      });
    }
  });

  // socket.on("update", (data) => {
  //   if (players[data.id]) {
  //     players[data.id].x = data.x;
  //     players[data.id].y = data.y;
  //     players[data.id].angle = data.angle;
  //   }
  // });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("removePlayer", socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});