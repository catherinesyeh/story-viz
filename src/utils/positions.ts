import { bezierCommand, svgPath } from "./curve";
import { normalizeMarkerSize } from "./helpers";

import {
  location_height,
  location_offset,
  scene_offset,
  character_height,
  character_offset,
  scene_base,
  plot_width,
  scene_width,
  location_buffer,
} from "./consts";
import {
  CharacterScene,
  Scene,
  SceneCharacter,
  CharacterData,
  RatingDict,
} from "./data";

/* INTERFACES */
export interface Position {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneSummaryBox {
  x: number;
  y: number;
  width: number;
}

export interface SceneSummaryText {
  x: number;
  end_x: number;
  section: number;
  y: number;
  title_y: number;
  summary_y: number;
  location_y: number;
  divider_y: number;
  character_y: number;
  character_list_y: number;
  character_offsets: number[];
  height: number;
}

/* ELEMENT POSITIONS */
// compute locations of locations labels
const locationPos = (locations: string[]) => {
  return locations.map((_, i) => {
    return location_height * i + location_offset;
  });
};

// compute locations of scene labels
const initialScenePos = (
  scene_width: number,
  scenes: string[],
  scene_data: Scene[],
  locations: string[],
  evenSpacing: boolean,
  max_characters: number,
  characterScenes: CharacterScene[],
  yAxis: string
) => {
  let cur_offset = scene_offset;

  const og_plot_width = scene_width * (scenes.length - 1);
  const totalLines = scene_data.reduce((acc, scene, i) => {
    return acc + (i === scene_data.length - 1 ? 0 : scene.numLines);
  }, 0);
  // adjust space between scenes based on number of lines in each scene if !evenSpacing
  const line_increment = evenSpacing ? scene_width : og_plot_width / totalLines;

  const num_characters = characterScenes.length;
  const maxLoc =
    locations.length <= 8 || yAxis === "location"
      ? location_height * (locations.length + 0.25)
      : Math.max(
          700,
          num_characters * (0.5 * character_offset + character_height)
        );

  return scenes.map((_, i) => {
    const num_lines =
      i === 0 ? 0 : evenSpacing ? 1 : scene_data[i - 1].numLines;
    const next_offset = line_increment * num_lines;
    cur_offset += next_offset;

    return {
      x: cur_offset,
      y: maxLoc + (max_characters - 2) * character_height,
    };
  });
};

// compute character positions
const characterPos = (
  characterScenes: CharacterScene[],
  initialScenePos: Position[],
  locationPos: number[],
  locations: string[],
  sceneLocations: string[],
  sceneCharacters: SceneCharacter[],
  scene_data: Scene[],
  sortedCharacters: CharacterData[]
) => {
  const charPos = characterScenes.map((character) => {
    return character.scenes.map((scene) => {
      const charsInScene = sceneCharacters[scene].characters;
      // sort character based on sortedCharacters
      const sortedChars = charsInScene.sort(
        (a, b) =>
          sortedCharacters.findIndex((char) => char.character === a) -
          sortedCharacters.findIndex((char) => char.character === b)
      );
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y:
          locationPos[locations.indexOf(sceneLocations[scene])] +
          location_offset * 0.5 +
          character_offset * sortedChars.indexOf(character.character),
      };
    });
  });

  const get_scalar = (num: number) => {
    return num > 24
      ? 0.5
      : num > 16
      ? 0.75
      : num > 12
      ? 1.25
      : num > 10
      ? 1.5
      : num > 6
      ? 2.5
      : num > 4
      ? 3.5
      : 5;
  };

  const num_characters = characterScenes.length;
  const scalar = get_scalar(num_characters);
  const maxLoc =
    num_characters * (scalar * character_offset + character_height);
  const char_inc = maxLoc / num_characters;

  const charStackPos = [] as Position[][];
  const yLines = [] as any; // Array to store each y-line and the characters placed on it

  characterScenes.forEach((character) => {
    let foundLine = false;

    // Iterate over each existing y-line
    for (let line of yLines) {
      const canShareLine = line.characters.every(
        (placedCharacter: CharacterScene) => {
          const firstSceneOfCharacter = Math.min(...character.scenes);
          const lastSceneOfCharacter = Math.max(...character.scenes);
          const firstSceneOfPlacedCharacter = Math.min(
            ...placedCharacter.scenes
          );
          const lastSceneOfPlacedCharacter = Math.max(
            ...placedCharacter.scenes
          );

          // Check if the current character's first scene is after the placed character's last scene
          return (
            firstSceneOfCharacter > lastSceneOfPlacedCharacter ||
            lastSceneOfCharacter < firstSceneOfPlacedCharacter
          );
        }
      );

      if (canShareLine) {
        // Place character on this line
        charStackPos.push(
          character.scenes.map((scene) => {
            return {
              x: initialScenePos[scene].x - 0.5 * character_height,
              y: line.y, // Use the y-coordinate of this line
            };
          })
        );
        // Add this character to the list of characters on this line
        line.characters.push(character);
        foundLine = true;
        break;
      }
    }

    if (!foundLine) {
      // Create a new line for the character
      const new_inc = 2.5 * character_offset + character_height;
      const newY = new_inc * yLines.length; // Calculate new y based on current number of lines
      charStackPos.push(
        character.scenes.map((scene) => {
          return {
            x: initialScenePos[scene].x - 0.5 * character_height,
            y: newY + 0.5 * character_offset, // Place character on a new line
          };
        })
      );
      // Add a new line with this character
      yLines.push({ y: newY, characters: [character] });
    }
  });

  // if more than 8 yLines, adjust y position
  if (yLines.length > 10) {
    const scalar_new = get_scalar(yLines.length);
    charStackPos.forEach((char, i) => {
      // find yLine for this character
      const line_ind = yLines.findIndex((line: any) =>
        line.characters.includes(characterScenes[i])
      );
      char.forEach((pos) => {
        pos.y =
          line_ind * (scalar_new * character_offset + character_height) +
          0.5 * character_offset;
      });
    });
  }

  const charListPos = characterScenes.map((character) => {
    const i = sortedCharacters.findIndex(
      (char) => char.character === character.character
    );
    return character.scenes.map((scene) => {
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y: char_inc * i + 0.5 * character_offset,
      };
    });
  });

  // max characters in a scene
  const max_characters_per_scene =
    Math.max(...sceneCharacters.map((scene) => scene.characters.length)) - 1;
  const prom_scalar = get_scalar(max_characters_per_scene);
  const new_max_y =
    max_characters_per_scene *
    (character_offset * prom_scalar + character_height);
  const prom_inc = new_max_y / max_characters_per_scene;

  const promPos = characterScenes.map((character) => {
    return character.scenes.map((scene) => {
      const cur_scene = scene_data[scene];
      const char_importance_rank = cur_scene.characters.find(
        (c) => c.name === character.character
      )?.importance_rank as number;
      // see if there are any other characters with the same importance
      const other_chars = cur_scene.characters.filter(
        (c) => c.importance_rank === char_importance_rank
      );
      // get index of current character in other_chars
      const char_index = other_chars.findIndex(
        (c) => c.name === character.character
      );
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y:
          0.5 * character_offset +
          prom_inc * (char_importance_rank - 1) +
          character_offset * char_index,
      };
    });
  });
  const emotionPos = characterScenes.map((character) => {
    return character.scenes.map((scene) => {
      const cur_scene = scene_data[scene];
      const char_emotion = cur_scene.characters.find(
        (c) => c.name === character.character
      )?.rating as number;
      // see if there are any other characters with the same emotion
      const other_chars = cur_scene.characters.filter(
        (c) => c.rating === char_emotion
      );
      // get index of current character in other_chars
      const char_index = other_chars.findIndex(
        (c) => c.name === character.character
      );
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y:
          new_max_y * 0.5 +
          location_offset * 0.5 -
          new_max_y * char_emotion * 0.5 +
          character_offset * char_index,
      };
    });
  });

  return {
    charPos: charPos,
    promPos: promPos,
    emotionPos: emotionPos,
    charListPos: charListPos,
    charStackPos: charStackPos,
    charInc: char_inc,
  };
};

// compute character square positions
const characterSquares = (
  characterScenes: CharacterScene[],
  initialScenePos: Position[],
  scene_data: Scene[],
  characterPos: Position[][]
) =>
  characterScenes.map((character, i) => {
    return character.scenes.map((scene, j) => {
      const importance = scene_data[scene].characters.find(
        (c) => c.name === character.character
      )?.importance as number;

      const normalized_importance = normalizeMarkerSize(
        character_height * importance
      );

      let char_y = characterPos[i][j].y;

      if (normalized_importance < character_height) {
        char_y += character_height / 2 - normalized_importance / 2;
      } else if (normalized_importance > character_height) {
        char_y -= normalized_importance / 2 - character_height / 2;
      }

      return {
        x: initialScenePos[scene].x - 0.5 * normalized_importance,
        y: char_y,
        width: normalized_importance,
        height: normalized_importance,
      };
    });
  });

// compute character paths

// track max_y at each x value corresponding to a scene using characterPos
// get max y value for each scene by using characterScenes to filter characterPos
let max_y_per_scene = (
  scenes: string[],
  characterPos: Position[][],
  initialScenePos: Position[]
) =>
  scenes.map((_, sceneIndex) => {
    // For each scene, find the max y value across all character positions that meet the condition
    return Math.max(
      ...characterPos
        .map(
          (
            characterPositions // Iterate over each character's positions array
          ) =>
            characterPositions
              .filter(
                (pos) =>
                  pos.x + 0.5 * character_height ===
                  initialScenePos[sceneIndex].x // Filter condition
              )
              .map((pos) => pos.y) // Extract y values
        )
        .flat() // Flatten the array of arrays of y values into a single array
    );
  });

function reverseSvgPath(path: string): string {
  const pathArr = path.split(" C ");

  pathArr[0] = pathArr[0].replace("M", "").trim();

  const posStr = pathArr.join(" ");

  const posStr_split = posStr.split(" ").reverse();

  let new_path = "M " + posStr_split[0];

  posStr_split.shift();
  posStr_split.forEach((pos, i) => {
    if (i % 3 === 0) {
      new_path += " C " + pos;
    } else {
      new_path += " " + pos;
    }
  });

  return new_path;
}

const createPathSegment = (
  coordsTop: number[][],
  coordsBottom: number[][],
  adjustments: number[] = []
) => {
  addStartAndEndPoints(coordsTop, coordsBottom);
  const topPath = svgPath(coordsTop, adjustments, bezierCommand);
  const bottomPath = reverseSvgPath(
    svgPath(coordsBottom, adjustments, bezierCommand)
  );
  const [, rightJoinPoint] = bottomPath.split(" C ")[0].split(",");
  const [, leftJoinPoint] = topPath.split(" C ")[0].split(",");
  return `${topPath} V ${rightJoinPoint} ${bottomPath} V ${leftJoinPoint}`;
};

const findAdjustments = (
  sceneCharacters: SceneCharacter[],
  character: string,
  scenes: number[],
  characterScenes: CharacterScene[],
  allCoords: Position[][]
) => {
  // console.log(character);
  // remove first and last points from coords, save as new array
  let adjustments = [] as number[];
  scenes.map((scene, i) => {
    const sceneChar = sceneCharacters[scene].characters;
    const charCoords = sceneChar.map((char) => {
      const charInfo = characterScenes.find((c) => c.character === char);
      const charIndex = characterScenes.findIndex((c) => c.character === char);
      const sceneIndex = charInfo?.scenes.indexOf(scene) as number;
      return {
        character: char,
        coords:
          allCoords[charIndex][sceneIndex] &&
          allCoords[charIndex][sceneIndex].y,
      };
    });
    // sort characters by order in characterScenes
    const sortedSceneChar = sceneChar.sort(
      (a, b) =>
        (charCoords.find((c) => c.character === a)?.coords ?? 0) -
        (charCoords.find((c) => c.character === b)?.coords ?? 0)
    );
    const charIndex = sortedSceneChar.indexOf(character);
    // const thisCharPos = coords[i][1];
    const thisCharPos = charCoords.find((c) => c.character === character)
      ?.coords as number;

    if (i < scenes.length - 1) {
      const nextSceneChar = sceneCharacters[scene + 1].characters;
      const nextCharCoords = nextSceneChar.map((char) => {
        const charInfo = characterScenes.find((c) => c.character === char);
        const charIndex = characterScenes.findIndex(
          (c) => c.character === char
        );
        const sceneIndex = charInfo?.scenes.indexOf(scene + 1) as number;
        return {
          character: char,
          coords:
            allCoords[charIndex][sceneIndex] &&
            allCoords[charIndex][sceneIndex].y,
        };
      });
      const nextCharPos = nextCharCoords.find((c) => c.character === character)
        ?.coords as number;
      if (
        // charIndex === nextCharIndex &&
        Math.abs(thisCharPos - nextCharPos) > character_offset
      ) {
        if (charIndex === 0) {
          // adjustments.push(1);
          adjustments.push(0);
        } else {
          // adjustments.push(-1);
          adjustments.push(0);
        }
      } else {
        adjustments.push(0);
      }
    } else {
      adjustments.push(0);
    }
  });
  // add 0 to the beginning and end of adjustments
  adjustments.unshift(0);
  adjustments.push(0);
  // console.log("adjustments", adjustments);
  return adjustments;
};

const characterPaths = (
  characterScenes: CharacterScene[],
  characterPos: Position[][],
  max_y_per_scene: number[],
  sceneCharacters: SceneCharacter[],
  scene_data: Scene[]
) => {
  const allPaths = characterScenes.map((character) => {
    const paths = [];

    const charCoords = characterPos[characterScenes.indexOf(character)];

    let coordsTop = [] as number[][],
      coordsBottom = [] as number[][],
      prevScene = null as number | null;

    let scenes_in_segment = [] as number[];
    character.scenes.forEach((scene, i) => {
      const [x, y] = [
        charCoords[i].x + character_height / 2,
        charCoords[i].y + character_height / 2,
      ];

      const importance = scene_data[scene].characters.find(
        (c) => c.name === character.character
      )?.importance as number;
      const weight = normalizeMarkerSize(character_height * importance) / 2;

      if (prevScene !== null && scene - prevScene > 1 && coordsTop.length) {
        const adjustments = findAdjustments(
          sceneCharacters,
          character.character,
          scenes_in_segment,
          characterScenes,
          characterPos
        );
        paths.push(createPathSegment(coordsTop, coordsBottom, adjustments));
        coordsTop = [];
        coordsBottom = [];
        scenes_in_segment = [];
      }

      coordsTop.push([x, y - weight]);
      coordsBottom.push([x, y + weight]);
      prevScene = scene;
      scenes_in_segment.push(scene);
    });

    if (coordsTop.length) {
      const adjustments = findAdjustments(
        sceneCharacters,
        character.character,
        scenes_in_segment,
        characterScenes,
        characterPos
      );
      paths.push(createPathSegment(coordsTop, coordsBottom, adjustments));
    }

    const firstPoint = {
      x: charCoords[0].x,
      y: charCoords[0].y + character_height / 2,
    };
    const lastPoint = {
      x: charCoords[charCoords.length - 1].x,
      y: charCoords[charCoords.length - 1].y + character_height / 2,
    };

    return { paths: paths, firstPoint: firstPoint, lastPoint: lastPoint };
  });

  return { paths: allPaths, max_y_per_scene };
};

// Helper function to add start and end points to the path segment
const addStartAndEndPoints = (
  topCoords: number[][],
  bottomCoords: number[][]
) => {
  // Add a point to the start of the path segment
  topCoords.unshift([topCoords[0][0] - scene_base / 3, topCoords[0][1]]);
  bottomCoords.unshift([
    bottomCoords[0][0] - scene_base / 3,
    bottomCoords[0][1],
  ]);

  // Add a point to the end of the path segment
  topCoords.push([
    topCoords[topCoords.length - 1][0] + scene_base / 3,
    topCoords[topCoords.length - 1][1],
  ]);
  bottomCoords.push([
    bottomCoords[bottomCoords.length - 1][0] + scene_base / 3,
    bottomCoords[bottomCoords.length - 1][1],
  ]);
};

const updateScenePos = (
  initialScenePos: Position[],
  max_y: number,
  yAxis: string
) => {
  // update scenePos y coords if max_y is greater than the current max
  if (max_y >= initialScenePos[0].y - 1.25 * location_offset) {
    initialScenePos.forEach((pos) => {
      pos.y = max_y + 1.25 * location_offset;
    });
  } else if (
    yAxis &&
    yAxis.includes("stacked") &&
    max_y < initialScenePos[0].y - 1.25 * location_offset
  ) {
    initialScenePos.forEach((pos) => {
      pos.y = max_y + 0.75 * location_height;
    });
  }
  return initialScenePos;
};

// compute scene box positions
const sceneBoxes = (
  sceneCharacters: SceneCharacter[],
  characterSquares: Box[][],
  scenePos: Position[],
  characterScenes: CharacterScene[]
) =>
  sceneCharacters.map((scene, i) => {
    const characters = scene.characters;
    const characterPos = characters.map((char) => {
      const scenes =
        characterScenes.find((c) => c.character === char)?.scenes || [];
      const sceneIndex = scenes.indexOf(i);
      const charIndex = characterScenes.findIndex((c) => c.character === char);
      return characterSquares[charIndex][sceneIndex];
    });
    const minYIndex =
      characterPos &&
      characterPos.findIndex(
        (s) => s && s.y === Math.min(...characterPos.map((s) => s && s.y))
      );
    const maxYIndex =
      characterPos &&
      characterPos.findIndex(
        (s) => s && s.y === Math.max(...characterPos.map((s) => s && s.y))
      );
    const firstChar = characterScenes.findIndex(
      (c) => c.character === characters[minYIndex]
    );
    const firstCharScene =
      characterScenes[firstChar] &&
      characterScenes[firstChar].scenes.findIndex((s) => s === i);
    const lastChar =
      characterScenes &&
      characterScenes.findIndex((c) => c.character === characters[maxYIndex]);
    const lastCharScene =
      characterScenes[lastChar] &&
      characterScenes[lastChar].scenes.findIndex((s) => s === i);

    const top =
      characterSquares[firstChar] &&
      characterSquares[firstChar][firstCharScene] &&
      characterSquares[firstChar][firstCharScene].y;
    const bottom =
      characterSquares[lastChar] &&
      characterSquares[lastChar][lastCharScene] &&
      characterSquares[lastChar][lastCharScene].y +
        characterSquares[lastChar][lastCharScene].height;

    return {
      x: scenePos[i].x - character_height,
      y: top - 0.5 * character_height,
      width: 2 * character_height,
      height: bottom - top + character_height,
    };
  });

export const findPotentialOverlappingScenes = (
  scenePos: Position[],
  baseBox: SceneSummaryBox
) =>
  scenePos.reduce((acc: number[], pos, i) => {
    if (
      pos.x > baseBox.x - character_offset &&
      pos.x < baseBox.x + baseBox.width + character_offset
    ) {
      acc.push(i);
    }
    return acc;
  }, []);

export const findOverlappingScenes = (
  potentialOverlappingScenes: number[],
  sceneCharacters: SceneCharacter[],
  characterScenes: CharacterScene[],
  characterPos: Position[][],
  sceneSummaryTexts: any
) =>
  potentialOverlappingScenes.reduce((acc: number[], sceneIndex) => {
    const characters = sceneCharacters[sceneIndex]
      ? sceneCharacters[sceneIndex].characters
      : [];

    // see if any characters' y pos will overlap with the scene overlay
    characters.some((char) => {
      // find index of character in characterScenes
      const charIndex = characterScenes.findIndex((c) => c.character === char);
      // find index of scene
      const charSceneIndex = characterScenes[charIndex].scenes.findIndex(
        (s) => s === sceneIndex
      );

      const charPos = characterPos[charIndex][charSceneIndex];
      const height = sceneSummaryTexts[sceneIndex]
        ? sceneSummaryTexts[sceneIndex].height
        : sceneSummaryTexts.height;
      if (charPos && charPos.y < height + character_offset) {
        acc.push(sceneIndex);
        return true;
      }
      return false;
    });

    return acc;
  }, []);

// compute overlay curve positions based on conflict/importance/etc. rating of each scene
const overlay_points = (
  ratings: number[],
  min_y_point: number,
  scenePos: Position[]
) => {
  const points = ratings.map((rating, i) => {
    // for each scene, compute the x and y coordinates for the curve
    const x = scenePos[i].x;
    // y should be between min_y_point and min_y_point + location_height (max rating)
    let rating_val = rating;
    if (rating_val < 0.1) {
      rating_val = 0.1;
    }
    const y = min_y_point - rating_val * location_height;
    return { x: x, y: y };
  });
  return points;
};
// compute overlay curve
const overlayPath = (
  conflict_points: Position[],
  min_conflict_y: number,
  activeSceneRange: number[]
) => {
  const active_conflict_points = conflict_points.slice(
    activeSceneRange[0],
    activeSceneRange[1]
  );
  const overlay_coords = active_conflict_points.map((point: any) => [
    point.x + character_height / 2 - 5,
    point.y + character_height / 2,
  ]);

  // adjust overlay_coords[0]
  overlay_coords[0] = [
    overlay_coords[0][0] - 1.25 * character_offset,
    overlay_coords[0][1],
  ];
  // adjust overlay_coords[overlay_coords.length - 1]
  overlay_coords[overlay_coords.length - 1] = [
    overlay_coords[overlay_coords.length - 1][0] + 1.25 * character_offset,
    overlay_coords[overlay_coords.length - 1][1],
  ];

  const path = svgPath(overlay_coords, {}, bezierCommand, 0.3);

  // add a point at the beginning and end of the curve to close it off
  const start = overlay_coords[0] && [overlay_coords[0][0], min_conflict_y];
  const end = overlay_coords[overlay_coords.length - 1] && [
    overlay_coords[overlay_coords.length - 1][0],
    min_conflict_y,
  ];

  const edited_path = path.replace("M", "M" + start[0] + "," + start[1] + " L");
  const final_path = edited_path + " L " + end[0] + "," + end[1];
  return final_path;
};

// get all positions
export const getAllPositions = (
  scene_data: Scene[],
  scenes: string[],
  locations: string[],
  characterScenes: CharacterScene[],
  sceneLocations: string[],
  sceneCharacters: SceneCharacter[],
  sortedCharacters: CharacterData[],
  evenSpacing: boolean,
  ratingDict: RatingDict,
  yAxis: string = "location",
  activeSceneRange: number[] = [0, scenes.length]
) => {
  const sceneWidth = scene_width(locations, scenes);

  // max characters in a scene
  const characters_per_scene = sceneCharacters.map(
    (scene) => scene.characters.length
  );
  const characters_neg_sent = scene_data.map((scene) => {
    const characters = scene.characters;
    const zero_sent = characters.filter((c) => c.rating === -1);
    return zero_sent.length;
  });
  const charMax = Math.max(...characters_per_scene);
  const negMax = charMax + Math.max(...characters_neg_sent);
  const max_characters = yAxis !== "sentiment" ? charMax : negMax;
  const initLocationPos = locationPos(locations);

  let initScenePos = initialScenePos(
    sceneWidth,
    scenes,
    scene_data,
    locations,
    evenSpacing,
    max_characters,
    characterScenes,
    yAxis
  );

  const plotWidth = plot_width(initScenePos);

  const characterInfo = characterPos(
    characterScenes,
    initScenePos,
    initLocationPos,
    locations,
    sceneLocations,
    sceneCharacters,
    scene_data,
    sortedCharacters
  );

  const initCharacterPos =
    yAxis === "location"
      ? characterInfo.charPos
      : yAxis === "importance"
      ? characterInfo.promPos
      : yAxis === "sentiment"
      ? characterInfo.emotionPos
      : yAxis === "character"
      ? characterInfo.charListPos
      : characterInfo.charStackPos;

  const charInc = characterInfo.charInc;

  const initCharacterSquares = characterSquares(
    characterScenes,
    initScenePos,
    scene_data,
    initCharacterPos
  );

  const initMaxYPerScene = max_y_per_scene(
    scenes,
    initCharacterPos,
    initScenePos
  );
  const pathInfo = characterPaths(
    characterScenes,
    initCharacterPos,
    initMaxYPerScene,
    sceneCharacters,
    scene_data
  );

  const initCharacterPathsAll = pathInfo.paths;
  const initCharacterPaths = initCharacterPathsAll.map((path) => path.paths);
  const initFirstPoints = initCharacterPathsAll.map((path) => path.firstPoint);
  const initLastPoints = initCharacterPathsAll.map((path) => path.lastPoint);
  const initMaxYPerSceneUpdated = pathInfo.max_y_per_scene;

  // compute max y value of characterPos
  const max_y = Math.max(...initMaxYPerSceneUpdated);

  initScenePos = updateScenePos(initScenePos, max_y, yAxis);

  const initSceneBoxes = sceneBoxes(
    sceneCharacters,
    initCharacterSquares,
    initScenePos,
    characterScenes
  );

  // const plotHeight = initScenePos[0].y + location_height * 2.5;
  const plotHeight = max_y + location_offset;

  const min_conflict_y = location_buffer;
  const initConflictPoints = overlay_points(
    ratingDict.conflict,
    min_conflict_y,
    initScenePos
  );

  const initConflictPath = overlayPath(
    initConflictPoints,
    min_conflict_y,
    activeSceneRange
  );

  const initImportancePoints = overlay_points(
    ratingDict.importance,
    min_conflict_y,
    initScenePos
  );
  const initImportancePath = overlayPath(
    initImportancePoints,
    min_conflict_y,
    activeSceneRange
  );

  const initLengthPoints = overlay_points(
    ratingDict.length,
    min_conflict_y,
    initScenePos
  );

  const initLengthPath = overlayPath(
    initLengthPoints,
    min_conflict_y,
    activeSceneRange
  );

  return {
    sceneWidth: sceneWidth,
    plotWidth: plotWidth,
    plotHeight: plotHeight,
    locationPos: initLocationPos,
    scenePos: initScenePos,
    characterPos: initCharacterPos,
    characterSquares: initCharacterSquares,
    characterPaths: initCharacterPaths,
    sceneBoxes: initSceneBoxes,
    conflictPath: initConflictPath,
    importancePath: initImportancePath,
    lengthPath: initLengthPath,
    minConflictY: min_conflict_y,
    charInc: charInc,
    firstPoints: initFirstPoints,
    lastPoints: initLastPoints,
  };
};
