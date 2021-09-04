const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Game = require("./Game");

const game = new Game(io);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendStatus(200);
});

server.listen(process.env.PORT || 3030, () => {
  console.log("listening on *:" + process.env.PORT || 3030);
});
