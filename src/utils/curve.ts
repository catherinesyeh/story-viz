// adapted from https://codepen.io/francoisromain/pen/dzoZZj

// The smoothing ratio
const smoothing = 0.4;

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
  reverse: any,
  secondLast: boolean
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
export const bezierCommand = (point: any, i: number, a: any) => {
  let secondLast = false;
  if (i === a.length - 2) {
    secondLast = true;
  }

  // start control point
  const cps = controlPoint(a[i - 1], a[i - 2], point, false, secondLast);

  // end control point
  const cpe = controlPoint(point, a[i - 1], a[i + 1], true, secondLast);
  //   return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
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
export const svgPath = (points: any, command: any) => {
  // build the d attributes by looping over the points
  const d = points.reduce(
    (acc: any, point: any, i: number, a: any) =>
      i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`,
    ""
  );
  return d;
};
