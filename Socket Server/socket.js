const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// All connected players
let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Create new player
  players[socket.id] = { x: 100, y: 100 };

  // Send existing players to the new one
  socket.emit("initialState", players);

  // Broadcast new player to everyone else
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  // Movement updates from client
  socket.on("move", (data) => {
    if (!players[socket.id]) return;
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    io.emit("update", { id: socket.id, x: data.x, y: data.y });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

http.listen(PORT, () => console.log("Server running on", PORT));
