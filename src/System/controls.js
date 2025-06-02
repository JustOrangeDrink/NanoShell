import { tiles } from "../tiles.js";
import {
  closeInventory,
  isInventoryOpen,
  openInventory,
} from "../UI/inventory.js";
import { addLog } from "../UI/sidebar.js";
import {
  longSkipAction,
  pickUpAction,
  skipAction,
  wieldAction,
} from "./actions.js";
import { getEntitiesUnder, tryMovement } from "./engine.js";

function handleInput(event, player) {
  let dx = 0;
  let dy = 0;

  // inventory UI
  switch (event.key) {
    case "Escape":
      closeInventory();
      break;
    default:
      break;
  }

  // main UI
  if (isInventoryOpen) return;
  switch (event.key) {
    case "4":
      dx += -1;
      break;
    case "6":
      dx += 1;
      break;
    case "8":
      dy += -1;
      break;
    case "2":
      dy += 1;
      break;
    case "7":
      dx -= 1;
      dy -= 1;
      break;
    case "9":
      dx += 1;
      dy -= 1;
      break;
    case "1":
      dx -= 1;
      dy += 1;
      break;
    case "3":
      dx += 1;
      dy += 1;
      break;

    case "g":
      pickUpAction.makeAction(
        player,
        [player, getEntitiesUnder(player, "Floor")[0]],
        [player, getEntitiesUnder(player, "Floor")[0]]
      );
      break;

    case "w":
      wieldAction.makeAction(
        player,
        [player, tiles.Sword.init()],
        [player, tiles.Sword.init()]
      );
      break;
    case "W":
      wieldAction.makeAction(
        player,
        [player, tiles.Shield.init()],
        [player, tiles.Shield.init()]
      );
      break;

    case "i":
      openInventory();
      break;

    case " ":
      player.getComponent("Collision").collision =
        !player.getComponent("Collision").collision;
      addLog(`NoClip: ${!player.getComponent("Collision").collision}`, "lime");
      break;
    case "5":
      skipAction.makeAction(player);
      break;
    case ".":
      longSkipAction.makeAction(player);
      break;

    default:
      break;
  }

  if (dx || dy) tryMovement(player, dx, dy);
}

export { handleInput };
