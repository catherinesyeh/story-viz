import {
  character_height,
  high_conflict_font,
  med_conflict_font,
} from "./consts";

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
  normalize(value, 0, character_height, 1, 14);

export const normalizeFontSize = (value: number) =>
  normalize(value, 0, 1, 0.6, 1.4);

export const normalizeTextOffset = (value: number) =>
  normalize(value, 0, 1, 1, 2.2);

export const getFontFamily = (value: number) =>
  // value ranges from 0 to 1
  // assign font family based on value (lowest values should be assigned to `inherit`; middle values to `"Shantell Sans", cursive`; highest values to `"Gluten", cursive`)

  // if value is less than 0.33, return 'inherit'
  value < 0.33
    ? "inherit"
    : // if value is less than 0.66, return 'Shantell Sans, cursive'
    value < 0.66
    ? med_conflict_font
    : // if value is less than 1, return 'Gluten, cursive'
      high_conflict_font;

export const getFontWeight = (value: number) =>
  // value ranges from 0 to 1
  // assign font weight based on value between 100-800 (100, 200, 300, 400, 500, 600, 700, 800)

  // if value is less than 0.125, return 100
  value < 0.125
    ? 100
    : // if value is less than 0.25, return 200
    value < 0.25
    ? 200
    : // if value is less than 0.375, return 300
    value < 0.375
    ? 300
    : // if value is less than 0.5, return 400
    value < 0.5
    ? 400
    : // if value is less than 0.625, return 500
    value < 0.625
    ? 500
    : // if value is less than 0.75, return 600
    value < 0.75
    ? 600
    : // if value is less than 0.875, return 700
    value < 0.875
    ? 700
    : // if value is less than 1, return 800
      800;

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

// remove numbers and punctuation from string
export const onlyLetters = (s: string) => s.replace(/[^a-zA-Z ]/g, "");

// format chapter name
export const chapterFormatted = (chapterName: string) => {
  return (
    chapterName.startsWith("Act") ||
    chapterName === "Prologue" ||
    chapterName.toLowerCase().includes("chapter")
  );
};
