import { entities, mainUiCanvas, mainUiCtx } from "../globals.js";
import { time } from "../globals.js";
import {
  countDigits,
  getEntityFromArray,
  numToRgba,
  setContextFillStyle,
} from "../utils.js";

const logs = [];
const below = [];

let player;

let timeShift = 100;

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
  mainUiCtx.fillStyle = "lime";

  mainUiCtx.fillText(`Performance Indicators`, 60, 40);

  mainUiCtx.font = "20px monospace";
  mainUiCtx.fillText(`System Integrity: ${currentHp}/${maxHp}`, 10, 100);
  mainUiCtx.fillText(
    `CPU Temperature: ${currentTemperature}/${maxTemperature}`,
    10,
    130
  );

  mainUiCtx.fillText(`Str: ${str}`, 10, 175);
  mainUiCtx.fillText(`Agi: ${agi}`, 10, 200);
  mainUiCtx.fillText(`Dur: ${dur}`, 10, 225);

  mainUiCtx.fillText(`DDG: ${ddg}`, 125, 175);
  mainUiCtx.fillText(`ARM: ${arm}`, 125, 200);
  mainUiCtx.fillText(`QKN: ${qkn}`, 125, 225);

  timeShift = countDigits(time.currentTime) * 10 + 100;
  mainUiCtx.fillStyle = "yellow";
  mainUiCtx.fillText(`Time: ${time.currentTime}`, 10, 325);
  mainUiCtx.fillText(`(${time.timeJump})`, timeShift, 325);
  mainUiCtx.fillStyle = "lime";

  writeLogs();
  writeBelow();
}

function addBelow(entities) {
  below.length = 0;
  below.push(...entities);
  updateUi();
}

function writeBelow() {
  mainUiCtx.fillText("Below:", 10, 350);
  for (let i = 0; i < below.length; i++) {
    const entityBelow = below[i];
    setContextFillStyle(mainUiCtx, entityBelow.color);
    mainUiCtx.fillText(entityBelow.currentTitle, 10, 375 + i * 20);
    mainUiCtx.fillStyle = "lime";
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
    let textShift = 10;
    for (let k = 0; k < log.length; k += 2) {
      const text = log[k];
      const color = Array.isArray(log[k + 1])
        ? numToRgba(log[k + 1])
        : log[k + 1];

      mainUiCtx.fillStyle = color;
      mainUiCtx.fillText(text, textShift, mainUiCanvas.height - 12 - i * 30);
      mainUiCtx.fillStyle = "lime";

      textShift += mainUiCtx.measureText(text).width;
    }
  }
}

export { addLog, addBelow, updateUi };
