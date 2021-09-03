const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let gameState = null;

app.get("/", (req, res) => {
  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  var characterId = null;
  socket.emit("gameState", gameState);

  socket.on("initGame", (msg) => {
    gameState = msg;
    characterId = msg.characterList[0].id;
    console.log(gameState?.characterList);
  });

  socket.on("addCharacter", (character) => {
    console.log("adding a character", character)
    characterId = character.id;
    gameState.characterList.push(character);
    console.log(gameState?.characterList);
    io.emit("updateCharacter", character);
  });

  socket.on("moveCharacter", (character) => {
    console.log("moving a character", character)
    gameState.characterList = gameState.characterList.filter(
      (c) => c.id !== character.id
    );
    gameState.characterList.push(character);
    console.log(gameState?.characterList);
    io.emit("updateCharacter", character);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected, removing character", characterId);
    let removedCharacter;
    gameState.characterList = gameState.characterList.map((character) => {
      if (character.id === characterId) {
        removedCharacter = { ...character, loc: { x: -1, y: -1 } };
        return removedCharacter;
      }
      return character;
    });
    console.log(gameState?.characterList);
    io.emit("updateCharacter", removedCharacter);
  });
});

server.listen(3030, () => {
  console.log("listening on *:3030");
});
