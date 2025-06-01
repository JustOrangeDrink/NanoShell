import { recolorize } from "../utils.js";

function hitAnimation(trgEntity, duration = 150) {
  recolorize(trgEntity, [255, 0, 0, 255], trgEntity.defaultBg);

  setTimeout(() => {
    recolorize(trgEntity, trgEntity.defaultColor, trgEntity.defaultBg);
  }, duration);
}

export { hitAnimation };
