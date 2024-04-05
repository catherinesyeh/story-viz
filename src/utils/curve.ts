// adapted from https://codepen.io/francoisromain/pen/dzoZZj

import { character_offset, location_buffer } from "./consts";

// The smoothing ratio
// const smoothing = 0.4;

// Properties of a line
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
const line = (pointA: any, pointB: any) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX / 2),
  };
};

// Position of a control point
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
const controlPoint = (
  current: any,
  previous: any,
  next: any,
  adjustment: number,
  prev_adjustment: number,
  next_adjustment: number,
  reverse: any,
  secondLast: boolean,
  smoothing: number = 0.4
) => {
  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  const p = previous || current;
  const n = next || current;

  // Properties of the opposed-line
  const o = line(p, n);

  // If is end-control-point, add PI to the angle to go backward
  let angle = o.angle + (reverse ? Math.PI : 0);
  if (secondLast && reverse && current[1] > previous[1]) {
    // adjust angle for second last point
    angle /= 2;
  }

  let length = o.length * smoothing;
  if (secondLast && reverse && current[1] > previous[1]) {
    // adjust length for second last point
    length *= 2;
  }

  // The control point position is relative to the current point
  let x = current[0] + Math.cos(angle) * length;
  let y = current[1] + Math.sin(angle) * 0;

  if (adjustment !== undefined) {
    if (adjustment > 0) {
      // moving down
      if (!reverse && next_adjustment === -1 * adjustment) {
        // console.log("1: here");
        if (
          (next && current[1] - next[1] > location_buffer) ||
          prev_adjustment === 0
        ) {
          // console.log("1.1: here");
          // console.log(prev_adjustment, adjustment, next_adjustment);
          const factor = next && current[1] - next[1] < location_buffer ? 1 : 2;
          x += factor * adjustment * character_offset;
        }
      } else if (
        !reverse &&
        prev_adjustment < 0 &&
        next_adjustment > 0 &&
        previous &&
        current[1] - previous[1] < location_buffer &&
        !(
          prev_adjustment < 0 &&
          adjustment > 0 &&
          next_adjustment === adjustment &&
          prev_adjustment === -1 * adjustment
        )
      ) {
        // console.log("1.2: here");
        // console.log(prev_adjustment, adjustment, next_adjustment);
        x -= adjustment * character_offset;
      } else if (
        reverse &&
        adjustment === 1 &&
        adjustment === next_adjustment &&
        adjustment === prev_adjustment * -1 &&
        previous &&
        previous[1] - current[1] > location_buffer
      ) {
        // console.log("here", prev_adjustment, adjustment, next_adjustment);
        x -= 0.75 * adjustment * character_offset;
      }
    } else if (adjustment < 0) {
      // moving up
      if (reverse && previous && current[1] - previous[1] > location_buffer) {
        x += adjustment * 2 * character_offset;
      } else if (previous && previous[1] - current[1] > location_buffer) {
        x += (adjustment + 1) * 0.5 * character_offset;
      } else if (
        !reverse &&
        prev_adjustment === 0 &&
        next &&
        next[1] - current[1] < location_buffer
      ) {
        x -= adjustment * 0.5 * character_offset;
      }

      if (
        !reverse &&
        prev_adjustment === 1 &&
        next_adjustment === prev_adjustment &&
        adjustment === prev_adjustment * -1 &&
        next &&
        next[1] - current[1] > location_buffer
      ) {
        // console.log("here 2", prev_adjustment, adjustment, next_adjustment);
        x -= 0.75 * adjustment * character_offset;
      }
    } else {
      // adjustment === 0 (big gap)
      if (
        (previous && Math.abs(current[1] - previous[1]) > location_buffer) ||
        (next && Math.abs(current[1] - next[1]) > location_buffer)
      ) {
        if (!reverse) {
          // console.log("1: here adj=0");
          // console.log(prev_adjustment, adjustment, next_adjustment);
          x += 0.5 * adjustment * character_offset;
          if (prev_adjustment === 0 && next_adjustment > 0) {
            // console.log("1.5: here");
            // console.log(prev_adjustment, adjustment, next_adjustment);
            x += 0.25 * next_adjustment * character_offset;
          }
        } else {
          // console.log("2: here");
          // console.log(prev_adjustment, adjustment, next_adjustment);
          x -= 2 * adjustment * character_offset;
          if (prev_adjustment === 0 && next_adjustment > 0) {
            // console.log("2.5: here");
            // console.log(prev_adjustment, adjustment, next_adjustment);
            x -= next_adjustment * character_offset;
          }
        }
      } else if (!reverse && prev_adjustment === 0 && next_adjustment < 0) {
        // console.log("3: here");
        // console.log(prev_adjustment, adjustment, next_adjustment);
        x -= 2 * next_adjustment * character_offset;
      } else if (prev_adjustment === 0 && next_adjustment > 0) {
        // console.log("4: here");
        // console.log(prev_adjustment, adjustment, next_adjustment);
        x -= 0.75 * (next_adjustment - 2) * character_offset;
      }
    }
  } else {
    // undefined adjustment
    if (prev_adjustment == 0 && next_adjustment === undefined) {
      // console.log("5: here");
      // console.log(prev_adjustment, adjustment, next_adjustment);
      if (reverse) {
        x -= 1.5 * character_offset;
      } else {
        x -= 0.5 * character_offset;
      }
    }
  }

  if (previous && x < previous[0]) {
    // ensure the control point does not go beyond the previous point
    x = previous[0];
  } else if (next && x > next[0]) {
    // ensure the control point does not go beyond the next point
    x = next[0];
  }

  return [x, y];
};

// Create the bezier curve command
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
export const bezierCommand = (
  point: any,
  adjustment: number[],
  i: number,
  a: any,
  smoothing: number = 0.4
) => {
  let secondLast = false;
  if (i === a.length - 2) {
    secondLast = true;
  }

  // start control point
  const cps = controlPoint(
    a[i - 1],
    a[i - 2],
    point,
    adjustment[i],
    adjustment[i - 1],
    adjustment[i + 1],
    false,
    secondLast,
    smoothing
  );

  // end control point
  const cpe = controlPoint(
    point,
    a[i - 1],
    a[i + 1],
    adjustment[i],
    adjustment[i - 1],
    adjustment[i + 1],
    true,
    secondLast,
    smoothing
  );
  return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
};

// Render the svg <path> element
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
export const svgPath = (
  points: any,
  adjustments: any,
  command: any,
  smoothing: number = 0.4
) => {
  // build the d attributes by looping over the points
  const d = points.reduce(
    (acc: any, point: any, i: number, a: any) =>
      i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${command(point, adjustments, i, a, smoothing)}`,
    ""
  );
  return d;
};
