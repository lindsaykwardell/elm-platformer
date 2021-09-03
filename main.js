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

const socket = io(window.location.origin, {
  path: "/socket.io",
});

socket.on("connect", () => {
  console.log("socket io client ready");
});

socket.on("gameState", (state) => {
  if (state) app.ports.receiveState.send(state);
});

socket.on("updateCharacter", (character) => {
  app.ports.updateCharacter.send(character);
});

app.ports.initState.subscribe((state) => {
  socket.emit("initGame", {
    grid: state.grid,
    characterList: state.characterList,
  });
});

app.ports.moveCharacter.subscribe((character) => {
  socket.emit("moveCharacter", character);
});

app.ports.addCharacter.subscribe((character) => {
  socket.emit("addCharacter", character);
});
