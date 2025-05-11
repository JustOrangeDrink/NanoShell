import { uiCanvas, uiCtx } from "./globals.js";
import { tiles } from "./tiles.js";

const logs = [];
const below = [];

const player = tiles.Player;
const playerCombat = player.components[2][1];
let playerMaxHp = playerCombat[0];
let playerCurrentHp = playerCombat[1];
let playerDamage = playerCombat[2];

function updateUi() {
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
    uiCtx.fillStyle = "white";
    uiCtx.fillText(entityBelow, 10, 275 + i * 20);
    uiCtx.fillStyle = "lime";
  }
}

function addLog(text) {
  logs.unshift(text);
  updateUi();
}

function writeLogs() {
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    uiCtx.fillText(log, 10, uiCanvas.height - 12 - i * 30);
  }
}

setTimeout(() => updateUi(), 100);

export { addLog, addBelow };
