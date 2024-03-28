/* CONSTS */
export const location_height = 100;
export const location_offset = location_height / 4;
export const scene_base = 100;
export const scene_offset = 2.75 * scene_base - 1.5 * location_offset;
const scene_margin = scene_base / 2;
export const character_height = 10;
export const character_offset = 1.5 * character_height;

export const scene_width = (scenes: string[]) => 2000 / scenes.length;
export const plot_width = (scenes: string[], scene_width: number) =>
  scene_offset +
  scene_width * scenes.length -
  (scene_width / 1.5 / scene_margin) * scene_margin;

// old: not currently being used
export const plot_height = (locations: string[]) =>
  location_height * (locations.length + 2.5);
