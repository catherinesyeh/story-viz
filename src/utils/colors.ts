import * as d3 from "d3";

// each character will be assigned a color
// export const colors = [
//   "#f77189",
//   "#dc8932",
//   "#ae9d31",
//   "#77ab31",
//   "#33b07a",
//   "#36ada4",
//   "#38a9c5",
//   "#6e9bf4",
//   "#cc7af4",
//   "#f565cc",
// ];

export const colors = [
  "rgb(247, 113, 137, 1)",
  "rgb(220, 137, 50, 1)",
  "rgb(174, 157, 49, 1)",
  "rgb(119, 171, 49, 1)",
  "rgb(51, 176, 122, 1)",
  "rgb(54, 173, 164, 1)",
  "rgb(56, 169, 197, 1)",
  "rgb(110, 155, 244, 1)",
  "rgb(204, 122, 244, 1)",
  "rgb(245, 101, 204, 1)",
];

// color scales
export const emotionColor = d3
  .scaleSequential(d3.interpolateRdBu)
  .domain([1, -1]);
export const conflictColor = d3.scaleSequential(d3.interpolateGreens);
export const importanceColor = d3.scaleSequential(d3.interpolatePurples);

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

// add all to dict
export const color_dict = {
  importance: importance_increments,
  conflict: conflict_increments,
  emotion: emotion_increments,
};
