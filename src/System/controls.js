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

let isDeveloperMod = false;

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

    case "e":
      openPopup("Equip");
      break;

    case "z":
      openPopup("Execute");
      break;

    case "x":
      openPopup("Drain");
      break;

    case "c":
      openPopup("Install");
      break;

    case "r":
      openPopup("Remove");
      break;

    case "d":
      openPopup("Drop");
      break;

    case "i":
      openInventory();
      break;

    case "`":
      isDeveloperMod = !isDeveloperMod;
      const increase = isDeveloperMod ? 10000 : -10000;
      const log = isDeveloperMod
        ? "Developer mode activated!"
        : "Developer mode deactivated!";

      player.getComponent("Stats").ddg += increase;
      player.getComponent("Stats").arm += increase;
      player.getComponent("Attributes").str += increase;
      player.getComponent("Attributes").agi += increase;
      player.getComponent("Attributes").dur += increase;
      addLog([`${log}`, "lime"]);
      break;

    case " ":
      if (!isDeveloperMod) return;
      player.getComponent("Collision").collision =
        !player.getComponent("Collision").collision;
      addLog([
        `NoClip: ${!player.getComponent("Collision").collision}`,
        "lime",
      ]);
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
