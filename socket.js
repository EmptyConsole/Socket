const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Create new player
  players[socket.id] = { x: 800, y: 800, angle: 0 };

  // Send full list to newcomer
  socket.emit("initialState", players);

  // Notify others
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    x: 800,
    y: 800,
    angle: 0
  });


  // Receive movement updates
  socket.on("updateData", (data) => {
    if (players[socket.id]) {
      players[socket.id] = { x: data.x, y: data.y, angle: data.angle };
      socket.broadcast.emit("update", {
        id: socket.id,
        x: data.x,
        y: data.y,
        angle: data.angle
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("removePlayer", socket.id);
  });
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
