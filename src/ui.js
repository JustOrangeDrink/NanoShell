import { uiCanvas, uiCtx } from "./globals.js";
import { time } from "./System/actions.js";
import { getEntity } from "./utils.js";

const logs = [];
const below = [];

function updateUi() {
  const player = getEntity(false, "Player");
  let playerCurrentHp = player.getComponent("Health").currentHp;
  let playerMaxHp = player.getComponent("Health").maxHp;
  let playerDamage = player.getComponent("Damage").dmg;

  uiCtx.clearRect(0, 0, 1000, 1000);

  uiCtx.font = "bold 25px courier";
  uiCtx.fillStyle = "lime";

  uiCtx.fillText(`Performance Indicators`, 60, 50);

  uiCtx.font = "20px courier";
  uiCtx.fillText(
    `System Integrity: ${playerCurrentHp}/${playerMaxHp}`,
    10,
    100
  );
  uiCtx.fillText(`Attack Potential: ${playerDamage}`, 10, 130);

  uiCtx.fillStyle = "yellow";
  uiCtx.fillText(`Time: ${time}`, 10, 200);
  uiCtx.fillStyle = "lime";

  writeLogs();
  writeBelow();
}

function addBelow(entities) {
  below.length = 0;
  below.push(...entities);
  updateUi();
}

function writeBelow() {
  uiCtx.fillText("Below:", 10, 250);
  for (let i = 0; i < below.length; i++) {
    const entityBelow = below[i];
    const red = entityBelow.color[0] * 255;
    const green = entityBelow.color[1] * 255;
    const blue = entityBelow.color[2] * 255;
    uiCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    uiCtx.fillText(entityBelow.name, 10, 275 + i * 20);
    uiCtx.fillStyle = "lime";
  }
}

function addLog(text, color) {
  logs.unshift([text, color]);
  if (logs.length > 8) logs.pop();
  updateUi();
}

function writeLogs() {
  for (let i = 0; i < logs.length; i++) {
    uiCtx.fillStyle = logs[i][1];
    const log = logs[i][0];
    uiCtx.fillText(log, 10, uiCanvas.height - 12 - i * 30);
    uiCtx.fillStyle = "lime";
  }
}

export { addLog, addBelow, updateUi };
