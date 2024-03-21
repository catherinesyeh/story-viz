// read in data from data folder
import gatsby_data from "./data/great_gatsby_scene_analysis.json";

export const data = gatsby_data["scenes"];
export const location_data = gatsby_data["locations"];
export const character_data = gatsby_data["characters"];

// get all locations by finding unique 'group' values in location object
export const locations = Array.from(
  new Set(data.map((scene: any) => scene.location.group))
);

// create generic chunk method
// I:  - quote (string): quote to be split into chunks
//     - chunk_size (number): maximum number of characters in each chunk
// O:  - (array): array of chunks
export const chunkQuote = (quote: string, chunk_size: number) => {
  const quoteChunks = [];
  let chunk = "";
  let words = quote.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (chunk.length + words[i].length < chunk_size) {
      chunk += words[i] + " ";
    } else {
      quoteChunks.push(chunk);
      chunk = words[i] + " ";
    }
  }
  quoteChunks.push(chunk);
  return quoteChunks;
};

// for each quote in location_data, split quote into chunk_size character chunks, making sure to keep full words
export const location_quotes = location_data.map((location: any) => {
  const chunked = chunkQuote('"' + location.quote + '"', 80);
  return {
    location: location.group,
    quote: chunked,
  };
});

// also chunk the location names
export const location_chunks = location_data.map((location: any) => {
  return chunkQuote(location.group, 24);
});

// get all characters by finding unique 'name' values in characters object
export const characters = Array.from(
  new Set(
    data.flatMap((scene: any) =>
      scene.characters.map((character: any) => character.name)
    )
  )
);

// each character will be assigned a color
export const colors = [
  "#f77189",
  "#dc8932",
  "#ae9d31",
  "#77ab31",
  "#33b07a",
  "#36ada4",
  "#38a9c5",
  "#6e9bf4",
  "#cc7af4",
  "#f565cc",
];

// get all scene names using 'name' attribute in each scene object
// index corresponds to scene number
export const scenes = data.map((scene: any) => scene.name);

// map each scene to location
export const sceneLocations = data.map((scene: any) => scene.location.group);

// split scene names into chunks of 30 characters
export const sceneChunks = scenes.map((scene: any) => chunkQuote(scene, 24));

// for each character, get all scenes they appear in
// sort by number of scenes they appear in (descending order)
export const characterScenes = characters
  .map((character: any) => {
    return {
      character: character,
      scenes: data
        .filter((scene: any) =>
          scene.characters.some(
            (char: any) => char.name.toLowerCase() === character.toLowerCase()
          )
        )
        .map((scene: any) => scene.number - 1),
      // also get all locations this character appears in
      locations: data
        .filter((scene: any) =>
          scene.characters.some(
            (char: any) => char.name.toLowerCase() === character.toLowerCase()
          )
        )
        .map((scene: any) => scene.location.group),
    };
  })
  .sort((a, b) => b.scenes.length - a.scenes.length);

// list characters in each scene, sorted by their number of scenes
export const sceneCharacters = scenes.map((scene: any) => {
  // find characters in scene using data
  const dataScene = data.find((s: any) => s.name === scene) as any;
  return {
    scene: scene,
    characters: dataScene.characters
      .map((char: any) => char.name)
      .sort((a: any, b: any) => {
        // find index of character in characterScenes
        const aIndex = characterScenes.findIndex(
          (charScene: any) =>
            charScene.character.toLowerCase() === a.toLowerCase()
        );
        const bIndex = characterScenes.findIndex(
          (charScene: any) =>
            charScene.character.toLowerCase() === b.toLowerCase()
        );
        return aIndex - bIndex;
      }),
  };
});

// split scene summaries into chunks of 105 characters
export const sceneSummaries = data.map((scene: any) => {
  // also chunk each character's quote for the first emotion in their emotions list
  // save in a dictionary with character name as key
  const chunk_size = 105;
  const chunkedEmotions = scene.characters.map((character: any) => {
    const chunked = chunkQuote(
      '"' + character.emotions[0].quote + '"',
      chunk_size
    );
    return { character: character.name, emotion_quote: chunked };
  });

  // sort chunked emotions by the order in characterScenes
  const sortedEmotions = chunkedEmotions.sort((a: any, b: any) => {
    const aIndex = characterScenes.findIndex(
      (charScene: any) =>
        charScene.character.toLowerCase() === a.character.toLowerCase()
    );
    const bIndex = characterScenes.findIndex(
      (charScene: any) =>
        charScene.character.toLowerCase() === b.character.toLowerCase()
    );
    return aIndex - bIndex;
  });

  const chunked = chunkQuote(scene.summary, chunk_size);
  return {
    scene: scene.name,
    summary: chunked,
    emotions: sortedEmotions,
  };
});

// for each quote in character-data, split quote into chunk_size character chunks, making sure to keep full words
export const character_quotes = character_data.map((character: any) => {
  const chunked = chunkQuote('"' + character.quote + '"', 80);
  return {
    character: character.name,
    quote: chunked,
  };
});

// adapted from https://codepen.io/francoisromain/pen/dzoZZj

// The smoothing ratio
const smoothing = 0.5;

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
