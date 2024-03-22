import { scenes, locations } from "./data";

/* CONSTS */
export const location_height = 100;
export const location_offset = location_height / 4;
export const scene_width = 100;
export const scene_offset = 2.75 * scene_width - location_offset;
const scene_margin = scene_width / 4;
export const character_height = 10;
export const character_offset = 1.5 * character_height;

export const plot_width = scene_width * (scenes.length + 1.75) + scene_margin;
export const plot_height =
  location_height * (locations.length + 2.4) + location_offset;

const line_length = scene_width * (scenes.length + 1);
const fade_in = scene_width / line_length / 2;

// convert to percent
export const fade_in_percent = fade_in * 100;
export const fade_out_percent = 100 - fade_in_percent;
