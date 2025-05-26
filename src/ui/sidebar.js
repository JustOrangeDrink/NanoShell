import { uiCanvas, uiCtx } from "../globals.js";
import { time } from "../System/actions.js";
import { getEntity } from "../utils.js";

const logs = [];
const below = [];

let player;
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

  const dv = statsComponent.dv;
  const av = statsComponent.av;

  const str = attributesComponent.str;
  const agi = attributesComponent.agi;
  const dur = attributesComponent.dur;

  uiCtx.clearRect(0, 0, 1000, 1000);

  uiCtx.font = "bold 25px courier";
  uiCtx.fillStyle = "lime";

  uiCtx.fillText(`Performance Indicators`, 60, 40);

  uiCtx.font = "20px courier";
  uiCtx.fillText(`System Integrity: ${currentHp}/${maxHp}`, 10, 100);
  uiCtx.fillText(
    `CPU Temperature: ${currentTemperature}/${maxTemperature}`,
    10,
    130
  );

  uiCtx.fillText(`Str: ${str}`, 10, 175);
  uiCtx.fillText(`Agi: ${agi}`, 10, 200);
  uiCtx.fillText(`Dur: ${dur}`, 10, 225);

  uiCtx.fillText(`DV: ${dv}`, 125, 175);
  uiCtx.fillText(`AV: ${av}`, 125, 200);

  uiCtx.fillStyle = "yellow";
  uiCtx.fillText(`Time: ${time}`, 10, 325);
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
  uiCtx.fillText("Below:", 10, 350);
  for (let i = 0; i < below.length; i++) {
    const entityBelow = below[i];
    const red = entityBelow.color[0] * 255;
    const green = entityBelow.color[1] * 255;
    const blue = entityBelow.color[2] * 255;
    uiCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    uiCtx.fillText(entityBelow.name, 10, 375 + i * 20);
    uiCtx.fillStyle = "lime";
  }
}

function addLog(text, color) {
  logs.unshift([text, color]);
  if (logs.length > 5) logs.pop();
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
