import {
  closeInventory,
  isInventoryOpen,
  openInventory,
} from "../ui/inventory.js";
import { addLog } from "../ui/sidebar.js";
import { longSkipAction, pickUpAction, skipAction } from "./actions.js";
import { getEntitiesUnder, tryMovement } from "./engine.js";

function handleInput(event, player) {
  let dx = 0;
  let dy = 0;

  // inventory ui
  switch (event.key) {
    case "Escape":
      closeInventory();
      break;
    default:
      break;
  }

  // main ui
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
      const itemsBelow = getEntitiesUnder(player, ["Floor"]);
      if (itemsBelow.length === 0) {
        addLog("There is nothing to pick up!", "white");
        break;
      }
      pickUpAction.makeAction(player, player, itemsBelow[0]);
      break;

    case "i":
      openInventory();
      break;

    case " ":
      player.getComponent("Collision").collision =
        !player.getComponent("Collision").collision;
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
