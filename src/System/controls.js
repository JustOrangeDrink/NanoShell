import { thronglerShine } from "../Animations/animations.js";
import { tiles } from "../tiles.js";
import {
  closeInventory,
  isInventoryOpen,
  openInventory,
} from "../ui/inventory.js";
import {
  chooseItem,
  closePopup,
  isPopupOpen,
  moveCursor,
  openPopup,
} from "../ui/popup.js";
import { addLog } from "../ui/sidebar.js";
import { longSkipAction, pickUpAction, skipAction } from "./actions.js";
import { getEntitiesUnder, tryMovement } from "./engine.js";

function handleInput(event, player) {
  let dx = 0;
  let dy = 0;

  // popup UI
  if (isPopupOpen) {
    switch (event.key) {
      case "Escape":
        closePopup();
        break;
      case "Enter":
        chooseItem();
        break;

      case "ArrowDown":
      case "j":
      case "2":
        moveCursor(1);
        break;

      case "ArrowUp":
      case "k":
      case "8":
        moveCursor(-1);
        break;

      default:
        break;
    }
    return;
  }

  // inventory UI
  if (isInventoryOpen) {
    switch (event.key) {
      case "Escape":
        closeInventory();
        break;
      default:
        break;
    }
    return;
  }

  // main UI
  if (isInventoryOpen || isPopupOpen) return;
  switch (event.key) {
    case "ArrowLeft":
    case "h":
    case "4":
      dx += -1;
      break;

    case "ArrowRight":
    case "l":
    case "6":
      dx += 1;
      break;

    case "ArrowUp":
    case "k":
    case "8":
      dy += -1;
      break;

    case "ArrowDown":
    case "j":
    case "2":
      dy += 1;
      break;

    case "y":
    case "7":
      dx -= 1;
      dy -= 1;
      break;

    case "u":
    case "9":
      dx += 1;
      dy -= 1;
      break;

    case "b":
    case "1":
      dx -= 1;
      dy += 1;
      break;

    case "n":
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
      openPopup("Wield");
      break;

    case "E":
      openPopup("Equip");
      break;

    case "e":
      openPopup("Execute");
      break;

    case "d":
      openPopup("Drain");
      break;

    case "r":
      openPopup("Remove");
      break;

    case "D":
      openPopup("Drop");
      break;

    case "i":
      openInventory();
      break;

    case " ":
      player.getComponent("Collision").collision =
        !player.getComponent("Collision").collision;
      addLog([
        `NoClip: ${!player.getComponent("Collision").collision}`,
        "lime",
      ]);
      break;
    case "`":
      player.getComponent("Stats").ddg += 10000;
      player.getComponent("Stats").arm += 10000;
      player.getComponent("Attributes").str += 10000;
      player.getComponent("Attributes").agi += 10000;
      player.getComponent("Attributes").dur += 10000;
      addLog([`Developer mode activated!`, "lime"]);
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
