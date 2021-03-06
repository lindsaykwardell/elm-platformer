import "./style.css";
import { Elm } from "./src/Main.elm";
import { io } from "socket.io-client";

const root = document.querySelector("#app div");
const app = Elm.Main.init({ node: root });

window.addEventListener("keydown", function (e) {
  if (["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key))
    e.preventDefault();

  switch (e.key) {
    case "ArrowDown":
      return app.ports.moveDown.send(true);
    case "ArrowUp":
      return app.ports.moveUp.send(true);
    case "ArrowRight":
      return app.ports.moveRight.send(true);
    case "ArrowLeft":
      return app.ports.moveLeft.send(true);
  }
});

const socket = io(import.meta.env.BASE_URL, {
  path: import.meta.env.DEV ? "/socket.io" : "",
});

socket.on("connect", () => {
  console.log("socket io client ready");
});

socket.on("gameState", (state) => {
  if (state) app.ports.receiveState.send(state);
});

socket.on("characterId", (id) => {
  app.ports.getPlayerCharacterId.send(id);
});

socket.on("updateCharacter", (character) => {
  app.ports.updateCharacter.send(character);
});

socket.on("chatMsg", (msg) => {
  app.ports.receiveChatMsg.send(msg);
  setTimeout(() => {
    var objDiv = document.querySelector(".chat");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, 1);
});

app.ports.initState.subscribe((state) => {
  socket.emit("initGame", state);
});

app.ports.moveCharacter.subscribe((character) => {
  socket.emit("moveCharacter", character);
});

app.ports.addCharacter.subscribe((character) => {
  socket.emit("addCharacter", character);
});

app.ports.sendChatMsg.subscribe((msg) => {
  socket.emit("chatMsg", msg);
});
