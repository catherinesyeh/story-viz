import { Position } from "./positions";

/* CONSTS */
export const med_conflict_font = '"Advent Pro", sans-serif';
export const high_conflict_font = "'Shantell Sans', cursive";

export const location_height = 100;
export const location_offset = location_height / 5;
export const scene_base = 100;
export const scene_offset = 2.75 * scene_base - 1.75 * location_offset;
const scene_margin = scene_base / 2;
export const character_height = 12;
export const character_offset = 1.5 * character_height;

export const location_buffer = location_height + 2 * character_height;

export const extra_yshift = (minConflictY: number, scenePos: Position[]) =>
  minConflictY - scenePos[0].y + 1.25 * character_height;

export const scene_width = (locations: string[], scenes: string[]) =>
  (2200 + 100 * Math.max(locations.length - 6, 0)) / scenes.length;
export const plot_width = (scenes: string[], scene_width: number) =>
  scene_offset +
  scene_width * scenes.length -
  (scene_width / 1.5 / scene_margin) * scene_margin;

// old: not currently being used
export const plot_height = (locations: string[]) =>
  location_height * (locations.length + 2.5);
