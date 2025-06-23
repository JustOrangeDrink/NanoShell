import { thronglerShine } from "./Animations/animations.js";
import {
  Collision,
  Size,
  Health,
  Turns,
  Damage,
  Alignment,
  Behavior,
  Stats,
  Occlusion,
  CPU,
  Attributes,
  Inventory,
  Pickable,
  Stack,
  WieldSlots,
  Weapon,
  Hidden,
  Shield,
  Armor,
  ArmorSlots,
  Script,
  Encryption,
  Crystal,
  EquipEffects,
  Chip,
  ChipSlots,
} from "./Component/components.js";
import { Entity } from "./Entity/entities.js";
import { guardBehavior } from "./System/ai.js";
import { randomTp, strengthBoost } from "./System/effects.js";
import {
  getChipString,
  getRandomColor,
  getScrollName,
  getRenderName,
} from "./utils.js";

const entityPresets = {};

function getPresetsByTags(...searchTags) {
  const result = [];

  for (const presetKey in entityPresets) {
    const preset = entityPresets[presetKey];

    if (preset.tags.length === 0) continue;

    for (let i = 0; i < searchTags.length; i++) {
      const searchTag = searchTags[i];
      if (preset.tags.includes(searchTag)) {
        result.push(preset);
      }
    }
  }

  return result;
}

class EntityPreset {
  constructor(
    name,
    singleTitle,
    multipleTitle,
    z,
    charX,
    charY,
    colorArray = [0, 0, 0, 0],
    components,
    tags = [],
    bgColorArray = [0, 0, 0, 0],
    animation = false
  ) {
    const [r, g, b, a] = colorArray;
    const [bgR, bgG, bgB, bgA] = bgColorArray;

    this.name = name;
    this.singleTitle = singleTitle;
    this.multipleTitle = multipleTitle;
    this.currentTitle = singleTitle;

    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.color = [r, g, b, a];
    this.bg = [bgR, bgG, bgB, bgA];
    this.renderName = getRenderName(name, colorArray, bgColorArray);

    this.components = components;

    this.tags = tags;

    this.animation = animation;

    entityPresets[name] = this;
  }

  init(x, y) {
    const entity = new Entity(
      this.name,
      this.singleTitle,
      this.multipleTitle,
      x,
      y,
      this.z,
      this.charX,
      this.charY,
      this.color,
      this.bg,
      this.animation
    );

    if (this.components) {
      for (let i = 0; i < this.components.length; i++) {
        const [component, ...componentArgs] = this.components[i];
        entity.addComponent(new component(...componentArgs));
      }
    }

    return entity;
  }
}

new EntityPreset(
  "Fist",
  "Fist",
  "Fists",
  0,
  0,
  0,
  [0, 0, 0, 0],
  [[Weapon, 0, 0, 0, "punch"]]
);

new EntityPreset(
  "Player",
  "Player",
  "Players",
  4,
  0,
  4,
  [255, 255, 255, 255],
  [
    [Collision],
    [Health, 30, 30],
    [CPU, 10],
    [Damage, 10],
    [Turns],
    [Alignment, "Good"],
    [Stats, 50, 0, 1],
    [Attributes, 3, 5, 3],
    [Inventory],
    [WieldSlots, 2, entityPresets.Fist.init()],
    [ArmorSlots, 1],
    [ChipSlots, 2],
  ],
  ["common"]
);

new EntityPreset(
  "Guard",
  "Guard",
  "Guards",
  3,
  7,
  4,
  [255, 0, 255, 255],
  [
    [Collision],
    [Health, 15, 15],
    [Damage, 5],
    [Turns],
    [Alignment, "Bad"],
    [Behavior, guardBehavior],
    [Stats, 40, 0, 1],
    [Attributes, 1, 1, 1],
    [WieldSlots, 2, entityPresets.Fist.init()],
  ],
  ["common", "enemy"]
);

new EntityPreset(
  "Bit",
  "Bit",
  "Bits",
  1,
  13,
  14,
  [255, 255, 0, 255],
  [[Size, "Tiny"], [Pickable], [Stack]],
  ["common", "item"]
);

const scriptTpEncryption = getScrollName(8);
new EntityPreset(
  "ScriptTeleportation",
  "Script of Teleportation",
  "Scripts of Teleportation",
  1,
  5,
  15,
  [225, 175, 100, 255],
  [
    [Size, "Tiny"],
    [Stack],
    [Pickable, "Execute"],
    [Script, [randomTp]],
    [
      Encryption,
      `Script of |${scriptTpEncryption}|`,
      `Scripts of |${scriptTpEncryption}|`,
    ],
  ],
  ["common", "item", "script"]
);

const scriptEnemySummonEncryption = getScrollName(8);
new EntityPreset(
  "ScriptEnemySummon",
  "Script of Enemy Summon",
  "Scripts of Enemy Summon",
  1,
  5,
  15,
  [225, 175, 100, 255],
  [
    [Size, "Tiny"],
    [Stack],
    [Pickable, "Execute"],
    [Script],
    [
      Encryption,
      `Script of |${scriptEnemySummonEncryption}|`,
      `Scripts of |${scriptEnemySummonEncryption}|`,
    ],
  ],
  ["common", "item", "script"]
);

const [crystalStrengthBurstColor, crystalStrengthBurstString] =
  getRandomColor(true);
new EntityPreset(
  "CrystalStrengthBurst",
  "Crystal of Strength Burst",
  "Crystals of Strength Burst",
  1,
  10,
  2,
  crystalStrengthBurstColor,
  [
    [Size, "Tiny"],
    [Stack],
    [Pickable, "Drain"],
    [Crystal, [strengthBoost, 6, 10]],
    [
      Encryption,
      `|${crystalStrengthBurstString}| Crystal`,
      `|${crystalStrengthBurstString}| Crystals`,
    ],
  ],
  ["common", "item", "crystal"]
);

new EntityPreset(
  "Floor",
  "Floor",
  "Floors",
  0,
  9,
  15,
  [85, 85, 85, 255],
  [],
  ["common", "construction"]
);

new EntityPreset(
  "Wall",
  "Wall",
  "Walls",
  2,
  3,
  2,
  [0, 255, 0, 255],
  [[Collision, true, true], [Occlusion]],
  ["common", "construction"],
  [0, 70, 0, 255]
);

new EntityPreset(
  "Door",
  "Door",
  "Doors",
  2,
  11,
  2,
  [0, 500, 0, 255],
  [[Collision, true, true], [Occlusion]],
  ["common", "construction"],
  [0, 60, 0, 255]
);

new EntityPreset(
  "Sword",
  "Sword",
  "Swords",
  1,
  8,
  1,
  [220, 220, 220, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Wield"],
    [Weapon, 5, 10, 1, "slash"],
  ],
  ["common", "item", "equip", "weapon"]
);

new EntityPreset(
  "Shield",
  "Shield",
  "Shields",
  1,
  8,
  14,
  [220, 220, 220, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Wield"],
    [Shield, 2, -5, 1],
  ],
  ["common", "item", "equip", "shield"]
);

new EntityPreset(
  "Throngler",
  "Throngler",
  "Thronglers",
  1,
  8,
  1,
  [255, 100, 255, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Wield"],
    [Weapon, 100, 1000, 1, "bonk"],
  ],
  ["developerItem"],
  [],
  [thronglerShine]
);

new EntityPreset(
  "Armor",
  "Armor",
  "Armors",
  1,
  14,
  1,
  [220, 220, 220, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Equip", "weapon"],
    [Armor, 4, -10, 1],
  ],
  ["common", "item", "equip", "armor"]
);

const chipStrengthName = getChipString(6);
new EntityPreset(
  "ChipStrength",
  "Chip of Strength",
  "Chips of Strength",
  1,
  1,
  9,
  [60, 255, 60, 255],
  [
    [Size, "Tiny"],
    [Pickable, "Install"],
    [Chip, 1],
    [
      Encryption,
      `Chip of |${chipStrengthName}|`,
      `Chips of |${chipStrengthName}|`,
    ],
    [EquipEffects, [strengthBoost, Infinity, 3]],
  ],
  ["common", "item", "chip"]
);

new EntityPreset(
  "Filler",
  "Filler",
  "Fillers",
  5,
  11,
  13,
  [255, 0, 0, 255],
  [[Hidden]],
  ["common", "effect"]
);

export { entityPresets, getPresetsByTags };
