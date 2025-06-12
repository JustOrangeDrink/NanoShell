import { entities, mainUiCanvas, mainUiCtx } from "../globals.js";
import { time } from "../globals.js";
import { getEntityFromArray, write } from "../utils.js";

const logs = [];
const below = [];

let player;

function updateUi() {
  if (!player) player = getEntityFromArray(false, "Player", entities);

  const healthComponent = player.getComponent("Health");
  const statsComponent = player.getComponent("Stats");
  const attributesComponent = player.getComponent("Attributes");
  const cpuComponent = player.getComponent("CPU");

  const currentHp = healthComponent.currentHp;
  const maxHp = healthComponent.maxHp;
  const currentTemperature = cpuComponent.currentTemperature;
  const maxTemperature = cpuComponent.maxTemperature;

  const ddg = statsComponent.ddg;
  const arm = statsComponent.arm;
  const qkn = statsComponent.qkn;

  const str = attributesComponent.str;
  const agi = attributesComponent.agi;
  const dur = attributesComponent.dur;

  mainUiCtx.clearRect(0, 0, 1000, 1000);

  mainUiCtx.font = "bold 25px monospace";

  write(mainUiCtx, ["Performance Indicators", "lime"], 60, 40);

  mainUiCtx.font = "20px monospace";
  write(
    mainUiCtx,
    [`System Integrity: ${currentHp}/${maxHp}`, "lime"],
    10,
    100
  );
  write(
    mainUiCtx,
    [`CPU Temperature: ${currentTemperature}/${maxTemperature}`, "lime"],
    10,
    130
  );

  write(mainUiCtx, [`Str: ${str}`, "lime"], 10, 175);
  write(mainUiCtx, [`Agi: ${agi}`, "lime"], 10, 200);
  write(mainUiCtx, [`Dur: ${dur}`, "lime"], 10, 225);

  write(mainUiCtx, [`DDG: ${ddg}`, "lime"], 125, 175);
  write(mainUiCtx, [`ARM: ${arm}`, "lime"], 125, 200);
  write(mainUiCtx, [`QKN: ${qkn}`, "lime"], 125, 225);

  write(
    mainUiCtx,
    [`Time: ${time.currentTime} (+${time.timeJump})`, "yellow"],
    10,
    325
  );

  writeLogs();
  writeBelow();
}

function addBelow(entities) {
  below.length = 0;
  below.push(...entities);
  updateUi();
}

function writeBelow() {
  write(mainUiCtx, ["Below:", "lime"], 10, 350);
  for (let i = 0; i < below.length; i++) {
    const entityBelow = below[i];
    write(
      mainUiCtx,
      [entityBelow.currentTitle, entityBelow.color],
      10,
      375 + i * 20
    );
  }
}

function addLog(arrayTextColor = ["Default", "lime"]) {
  logs.unshift(arrayTextColor);
  if (logs.length > 5) logs.pop();
  updateUi();
}

function writeLogs() {
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    write(mainUiCtx, log, 10, mainUiCanvas.height - 12 - i * 30);
  }
}

export { addLog, addBelow, updateUi };
