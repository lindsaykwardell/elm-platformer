import "./style.css";
import { Elm } from "./src/Main.elm";

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
    default:
      console.log("No movement");
  }
});
