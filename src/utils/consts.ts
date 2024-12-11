import { Position } from "./positions";

/* CONSTS */
export const med_conflict_font = "'Shantell Sans', cursive";
export const high_conflict_font = "'Handjet', sans-serif";
export const scene_overlay_width = 670;
export const scene_overlay_width_wide = 750;

export const location_height = 100;
export const location_offset = location_height / 5;
export const scene_base = 100;
export const scene_offset = scene_base;
const scene_margin = scene_base / 2;
export const character_height = 12;
export const character_offset = 1.5 * character_height;

export const location_buffer = location_height + 2 * character_height;

export const extra_yshift = (minConflictY: number, scenePos: Position[]) =>
  minConflictY - scenePos[0].y + 1.25 * character_height;

export const scene_width = (locations: string[], scenes: string[]) => {
  let width;
  if (scenes.length <= 24) {
    width = (2200 + 100 * Math.max(locations.length - 6, 0)) / scenes.length;
  } else {
    width = 100;
  }
  return width;
};
export const plot_width = (scene_pos: Position[]) =>
  scene_pos[scene_pos.length - 1] &&
  scene_pos[scene_pos.length - 1].x + scene_margin;

// old: not currently being used
export const plot_height = (locations: string[]) =>
  location_height * (locations.length + 2.5);
