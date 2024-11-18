import * as d3 from "d3";
import { CharacterData } from "./data";
import chroma from "chroma-js";

// colors for characters
const colors1 = chroma.scale("YlOrRd").padding([0.25, 0.1]).colors(7).reverse();
const colors2 = chroma.scale("YlGn").padding([0.35, 0.55]).colors(2);
const colors3 = chroma.scale("YlGnBu").padding([0.35, 0.1]).colors(7);
const colors4 = chroma.scale("RdPu").padding([0.3, 0.1]).colors(7).reverse();

const allColors = chroma.scale(
  colors1.concat(colors2).concat(colors3).concat(colors4)
);

// export const emotionColor = d3
// .scaleSequential(d3.interpolateRdBu).domain([1, -1]);

// const blues = chroma.scale("Blues").padding([0.1, 0]).colors(7).reverse();
const blues = chroma.scale("RdBu").padding([0.6, 0]).colors(7).reverse();
// const reds = chroma.scale("Reds").padding([0.1, 0]).colors(7);
const reds = chroma.scale("RdBu").padding([0, 0.6]).colors(7).reverse();
export const emotionColor = chroma
  .scale(blues.concat("#ddd").concat(reds))
  .domain([-1, 1]);
// console.log(emotionColor.colors(5));

// export const conflictColor = d3.scaleSequential(d3.interpolateGreens);
export const conflictColor = chroma.scale("Greens").padding([0.25, 0]);
// console.log(conflictColor.colors(5));

// export const importanceColor = d3.scaleSequential(d3.interpolatePurples);
export const importanceColor = chroma.scale("Purples").padding([0.25, 0]);
// console.log(importanceColor.colors(5));

// export const lengthColor = d3
//   .scaleSequential(d3.interpolateOranges);
export const lengthColor = chroma.scale("Oranges").padding([0.25, 0]);
// console.log(lengthColor.colors(5));

export default [
  d3.scaleSequential(d3.interpolateOrRd),
  d3.scaleSequential(d3.interpolatePuRd),
  d3.scaleSequential(d3.interpolateBuPu),
  d3.scaleSequential(d3.interpolatePuBu),
  d3.scaleSequential(d3.interpolateBuGn),
  d3.scaleSequential(d3.interpolateGnBu),
];

// see if color is too dark --> if so, return white, else return black
export const textColor = (val: number, diverging: boolean) => {
  if (diverging) {
    return val < 0.6 && val > -0.6 ? "black" : "white";
  }
  return val < 0.6 ? "black" : "white";
};
// get 5 equally spaced colors between domain[0] and domain[1]
const color_increments = (color: any) => {
  const domain = color.domain();
  const increments = d3.range(
    domain[0],
    domain[1] + (domain[1] - domain[0]) / 4,
    (domain[1] - domain[0]) / 4
  );
  const sorted = increments.sort((a, b) => a - b);
  return sorted;
};

// create color_increments for each color scale
const emotion_increments = color_increments(emotionColor);
const conflict_increments = color_increments(conflictColor);
const importance_increments = color_increments(importanceColor);
const length_increments = color_increments(lengthColor);

// add all to dict
export const color_dict = {
  length: length_increments,
  importance: importance_increments,
  conflict: conflict_increments,
  sentiment: emotion_increments,
} as { [key: string]: number[] };

// get color for character
export const getColor = (
  character: string,
  sortedCharacters: CharacterData[]
) => {
  const characters = sortedCharacters.map((d) => d.character);
  const charIndex = characters.indexOf(character);
  const colorIndex = charIndex / (sortedCharacters.length - 1);
  let finalColor = chroma(allColors(colorIndex)).css();

  return finalColor;
};

// get group color
export const getGroupColor = (group: string, sortedGroups: string[]) => {
  const charIndex = sortedGroups.indexOf(group);
  const colorIndex = charIndex / (sortedGroups.length - 1);
  let finalColor = chroma(allColors(colorIndex)).css();

  return finalColor;
};

// get llm color for character
export const getLLMColor = (
  character: string,
  sortedCharacters: CharacterData[]
) => {
  const char = sortedCharacters.find((c) => c.character === character);
  return char?.color;
};

// get text color for llm color
export const textColorLLM = (bgColor: string) => {
  // get r, g, b values from bgColor: a string in the format "rgb(r, g, b)"
  const rgb = bgColor.match(/\d+/g);
  if (!rgb) return "black";
  const r = parseInt(rgb[0]);
  const g = parseInt(rgb[1]);
  const b = parseInt(rgb[2]);
  return r * 0.299 + g * 0.587 + b * 0.114 > 100 ? "black" : "white";
};
