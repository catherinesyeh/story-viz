import { character_height } from "./consts";

// capitalize first letter of string
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// write generic normalize function
export const normalize = (
  value: number,
  min: number,
  max: number,
  newMin: number,
  newMax: number
) => newMin + ((value - min) * (newMax - newMin)) / (max - min);

// normalize rating (originally between -1 and 1) to between 0 and 1
export const normalizeRating = (rating: number) =>
  normalize(rating, -1, 1, 0, 1);

export const normalizeMarkerSize = (value: number) =>
  normalize(value, 0, character_height, 2, 14);

export const normalizeFontSize = (value: number) =>
  normalize(value, 0, 1, 0.7, 1.5);

export const normalizeTextOffset = (value: number) =>
  normalize(value, 0, 1, 1.2, 2.4);

const characterWidths: { [char: string]: number } = {
  // Narrow characters
  i: 1,
  l: 1,
  j: 1.2,
  f: 1.2,
  t: 1.3,
  // Medium characters (most lowercase letters)
  a: 1.5,
  c: 1.5,
  e: 1.5,
  m: 2.2,
  n: 1.8,
  o: 1.5,
  r: 1.3,
  s: 1.5,
  u: 1.8,
  v: 1.8,
  x: 1.8,
  z: 1.5,
  b: 1.7,
  d: 1.7,
  g: 1.7,
  h: 1.8,
  k: 1.8,
  p: 1.7,
  q: 1.7,
  y: 1.8,
  // Wider lowercase letters
  w: 2.1,
  // Uppercase letters
  A: 2,
  B: 2,
  C: 2,
  D: 2,
  E: 1.8,
  F: 1.7,
  G: 2,
  H: 2,
  I: 1.3,
  J: 1.5,
  K: 2,
  L: 1.8,
  M: 2.4,
  N: 2,
  O: 2.1,
  P: 2,
  Q: 2.1,
  R: 2,
  S: 2,
  T: 1.9,
  U: 2,
  V: 2,
  W: 2.4,
  X: 2,
  Y: 2,
  Z: 2,
  // Assuming space is as narrow as the narrowest character
  " ": 1,
};

export const getStringWidth = (s: string) =>
  // use characterWidths or return '1' as each width if the character is not in the characterWidths object
  s.split("").reduce((acc, char) => acc + (characterWidths[char] || 1), 0);
