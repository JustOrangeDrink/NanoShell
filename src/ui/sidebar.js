import { mainUiCanvas, mainUiCtx } from "../globals.js";
import { time } from "../globals.js";
import { countDigits, getEntity } from "../utils.js";

const logs = [];
const below = [];

let player;

let timeShift = 100;

function updateUi() {
  if (!player) player = getEntity(false, "Player");

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

  mainUiCtx.font = "bold 25px courier";
  mainUiCtx.fillStyle = "lime";

  mainUiCtx.fillText(`Performance Indicators`, 60, 40);

  mainUiCtx.font = "20px courier";
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
    const red = entityBelow.color[0] * 255;
    const green = entityBelow.color[1] * 255;
    const blue = entityBelow.color[2] * 255;
    mainUiCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    mainUiCtx.fillText(entityBelow.title, 10, 375 + i * 20);
    mainUiCtx.fillStyle = "lime";
  }
}

function addLog(text, color) {
  logs.unshift([text, color]);
  if (logs.length > 5) logs.pop();
  updateUi();
}

function writeLogs() {
  for (let i = 0; i < logs.length; i++) {
    mainUiCtx.fillStyle = logs[i][1];
    const log = logs[i][0];
    mainUiCtx.fillText(log, 10, mainUiCanvas.height - 12 - i * 30);
    mainUiCtx.fillStyle = "lime";
  }
}

export { addLog, addBelow, updateUi };
