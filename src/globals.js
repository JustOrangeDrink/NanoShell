const html = document.querySelector("html");

const SCREEN_WIDTH = html.clientWidth;
const SCREEN_HEIGHT = html.clientHeight;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const spritesheet = document.createElement("img");

const TILE_SIZE = 24;

export { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE, canvas, ctx, spritesheet };
