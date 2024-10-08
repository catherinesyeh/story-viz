import { color_dict } from "./colors";
import { bezierCommand, svgPath } from "./curve";
import { normalizeMarkerSize, getStringWidth } from "./helpers";

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
  CharacterQuote,
  CharacterScene,
  LocationQuote,
  Scene,
  SceneCharacter,
  SceneSummary,
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
  const num_characters = characterScenes.length;
  const maxLoc =
    locations.length <= 8
      ? locationPos[locations.length - 1]
      : Math.max(
          700,
          num_characters * (0.5 * character_offset + character_height)
        );
  const char_inc = maxLoc / num_characters;
  const promPos = characterScenes.map((character) => {
    return character.scenes.map((scene) => {
      const cur_scene = scene_data[scene];
      const char_importance = cur_scene.characters.find(
        (c) => c.name === character.character
      )?.importance as number;
      // see if there are any other characters with the same importance
      const other_chars = cur_scene.characters.filter(
        (c) => c.importance === char_importance
      );
      // get index of current character in other_chars
      const char_index = other_chars.findIndex(
        (c) => c.name === character.character
      );
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y:
          maxLoc +
          location_offset * 0.5 -
          maxLoc * char_importance +
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
          maxLoc * 0.5 +
          location_offset * 0.5 -
          maxLoc * char_emotion * 0.5 +
          character_offset * char_index,
      };
    });
  });
  const charListPos = characterScenes.map((character) => {
    const i = sortedCharacters.findIndex(
      (char) => char.character === character.character
    );
    return character.scenes.map((scene) => {
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y: char_inc * i,
      };
    });
  });

  return {
    charPos: charPos,
    promPos: promPos,
    emotionPos: emotionPos,
    charListPos: charListPos,
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
      const sortedNextSceneChar = nextSceneChar.sort(
        (a, b) =>
          (nextCharCoords.find((c) => c.character === a)?.coords ?? 0) -
          (nextCharCoords.find((c) => c.character === b)?.coords ?? 0)
      );
      const nextCharIndex = sortedNextSceneChar.indexOf(character);
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
  scene_width: number,
  characterScenes: CharacterScene[],
  characterPos: Position[][],
  max_y_per_scene: number[],
  sceneCharacters: SceneCharacter[],
  scene_data: Scene[],
  scenePos: Position[]
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

    return paths;
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

const updateScenePos = (initialScenePos: Position[], max_y: number) => {
  // update scenePos y coords if max_y is greater than the current max
  if (max_y >= initialScenePos[0].y - 1.25 * location_offset) {
    initialScenePos.forEach((pos) => {
      pos.y = max_y + 1.25 * location_offset;
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

// compute pos of legend items
const legendPos = (plotWidth: number, sortedCharacters: CharacterData[]) => {
  // get characterNames from characterScenes
  const characters = sortedCharacters.map((char) =>
    char.short ? char.short : char.character
  );

  const divide_by = Math.max(5, characters.length / 4);

  const numRows = Math.round(characters.length / divide_by);

  // break characters into groups of numRows
  const groups = characters.reduce((acc, char, i) => {
    const groupIndex = Math.floor(i / numRows);
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }
    acc[groupIndex].push(char);
    return acc;
  }, [] as string[][]);

  // find max length of characters in each row
  const max_lengths = groups.map((group) => {
    return Math.max(...group.map((char) => getStringWidth(char)));
  });
  let legend_offset =
    max_lengths[max_lengths.length - 1] * 4 + 2.25 * character_offset;

  let all_pos = [] as Position[];

  // compute positions for each character
  groups.reverse().forEach((group, i) => {
    const my_offset = legend_offset;
    group.forEach((_, j) => {
      const x_offset = plotWidth - my_offset;
      const y_offset =
        location_offset * 0.5 + (group.length - j - 1) * 1.6 * character_height;

      all_pos.push({
        x: x_offset,
        y: y_offset,
      });
    });

    let factor = 4;
    if (i < groups.length - 1) {
      factor =
        max_lengths[max_lengths.length - i - 2] /
        max_lengths[max_lengths.length - i - 1];
    }
    legend_offset +=
      max_lengths[max_lengths.length - i - 1] * 4 +
      2.75 * factor * character_offset;
  });

  return all_pos.reverse();
};
// legend box pos
const legend_box_pos = (plotWidth: number, legendPos: Position[]) => {
  // find min x in legendPos
  const min_x = Math.min(...legendPos.map((pos) => pos.x));
  // find max y in legendPos
  const max_y = Math.max(...legendPos.map((pos) => pos.y));
  return {
    x: min_x - character_offset,
    y: 0,
    width: plotWidth - min_x + character_offset,
    height: max_y + 1.4 * character_offset,
  };
};

// location quote box positions
const location_quote_boxes = (
  locations: string[],
  locationPos: number[],
  location_quotes: LocationQuote[]
) => {
  // console.log(location_quotes);
  return locations.map((loc, i) => {
    // console.log(loc);
    const cur_quote =
      location_quotes.find((quote) => quote.location === loc) ||
      location_quotes[i];
    return {
      x: scene_offset - 1.25 * location_offset,
      y: locationPos[locationPos.length - 2] - location_offset,
      width: scene_base * 5.5 - 2 * character_offset,
      height: (cur_quote.quote.length + 2.5) * character_offset,
    };
  });
};

// location quote text positions
const location_quote_texts = (
  locations: string[],
  locationPos: number[],
  location_quotes: LocationQuote[]
) =>
  locations.map((loc, i) => {
    const cur_quote =
      location_quotes.find((quote) => quote.location === loc) ||
      location_quotes[i];
    return cur_quote.quote.map((_, j) => {
      return {
        x: scene_offset - 0.5 * location_offset,
        y: locationPos[locationPos.length - 2] + (j + 1.45) * character_offset,
      };
    });
  });

// character quote box positions
const character_quote_boxes = (
  characterScenes: CharacterScene[],
  legend_box_pos: Box,
  character_quotes: CharacterQuote[]
) => {
  // console.log(character_quotes);
  return characterScenes.map((char, i) => {
    // console.log(char.character);
    const cur_quote =
      character_quotes.find((c) => c.character === char.character) ||
      character_quotes[i];
    const width = scene_base * 5.5 + character_offset;
    return {
      x: Math.min(
        legend_box_pos.x,
        legend_box_pos.x + legend_box_pos.width - width
      ),
      y: legend_box_pos.y + legend_box_pos.height + 1.75 * character_offset,
      width: width,
      height: (Math.max(cur_quote.quote.length, 2) + 2.45) * character_offset,
    };
  });
};

// character quote text positions
const character_quote_texts = (
  characterScenes: CharacterScene[],
  character_quote_boxes: Box[],
  character_quotes: CharacterQuote[]
) =>
  characterScenes.map((char, i) => {
    const cur_quote =
      character_quotes.find((c) => c.character === char.character) ||
      character_quotes[i];
    return cur_quote.quote.map((_, j) => {
      return {
        x:
          character_quote_boxes[i].x +
          0.75 * location_offset +
          0.6 * location_height,
        y: character_quote_boxes[i].y + (j + 2.55) * character_offset,
      };
    });
  });

// color description box positions
const color_description_boxes = (
  character_quote_boxes: Box[],
  characterScenes: CharacterScene[],
  character_data: CharacterData[]
) => {
  return characterScenes.map((char, i) => {
    const cur_quote =
      character_data.find((c) => c.character === char.character) ||
      character_data[i];
    return {
      x: character_quote_boxes[i].x,
      y: character_quote_boxes[i].y + character_quote_boxes[i].height,
      width: character_quote_boxes[i].width,
      height: (cur_quote.explanation.length + 1.45) * character_offset,
    };
  });
};

const color_description_texts = (
  characterScenes: CharacterScene[],
  color_description_boxes: Box[],
  character_data: CharacterData[]
) =>
  characterScenes.map((char, i) => {
    const cur_quote =
      character_data.find((c) => c.character === char.character) ||
      character_data[i];

    const explanation = cur_quote.explanation as string[];
    return explanation.map((_, j) => {
      return {
        x: color_description_boxes[i].x + 0.75 * location_offset,
        y: color_description_boxes[i].y + (j + 1.45) * character_offset,
      };
    });
  });

// scene quote box positions
const base_scene_summary_box = (legendBoxPos: Box) => {
  const width = scene_base * 8.5;
  return {
    x: legendBoxPos.x - width - 2 * character_offset,
    y: 0,
    width: width,
  } as SceneSummaryBox;
};

const scene_summary_texts = (
  scene_summary_boxes: SceneSummaryBox,
  scenes: string[],
  sceneSummaries: SceneSummary[],
  numRatings: number
) =>
  scenes.map((_, i) => {
    const start_x = scene_summary_boxes.x + 0.9 * character_offset;
    const end_x = start_x + scene_summary_boxes.width - 1.7 * location_offset;
    const section =
      (end_x - start_x) / numRatings -
      (1 - 0.05 * (numRatings + 1)) * character_offset;

    let start_y = 1.75 * character_offset;
    const title_y = start_y + 2.4 * character_offset;
    const summary_y = title_y + 1.6 * character_offset;
    const end_summary_y =
      summary_y + 1.2 * sceneSummaries[i].summary.length * character_offset;
    const location_y = end_summary_y + 0.6 * character_offset;
    const divider_y = location_y + character_offset;
    const character_y = divider_y + 1.6 * character_offset;
    const character_list_y = character_y + 1.6 * character_offset;

    // compute offset needed for each character in the list
    let total_offset = 0;
    const character_offsets = sceneSummaries[i].emotions.map((char: any) => {
      const cur_offset = total_offset;
      total_offset +=
        (char.emotion_quote.length - 1) * 1.2 * character_offset +
        1.6 * character_offset;
      return cur_offset;
    });

    const num_characters = sceneSummaries[i].emotions.length;
    const last_character = sceneSummaries[i].emotions[num_characters - 1];
    const last_quote_index = last_character.emotion_quote.length - 1;

    const height =
      character_list_y +
      1.4 * num_characters * character_offset +
      1.2 * last_quote_index * character_offset +
      character_offsets[num_characters - 1] +
      character_offset;

    return {
      x: start_x,
      end_x: end_x,
      section: section,
      y: start_y,
      title_y: title_y,
      summary_y: summary_y,
      location_y: location_y,
      divider_y: divider_y,
      character_y: character_y,
      character_list_y: character_list_y,
      character_offsets: character_offsets,
      height: height,
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
  sceneSummaryTexts: any,
  yShift: number
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
      if (charPos && charPos.y < height - yShift + character_offset) {
        acc.push(sceneIndex);
        return true;
      }
      return false;
    });

    return acc;
  }, []);

// update scene summary box and text positions
const update_scene_summaries = (
  legendBoxPos: Box,
  plotWidth: number,
  scenePos: Position[],
  baseBox: SceneSummaryBox,
  characterScenes: CharacterScene[],
  sceneCharacters: SceneCharacter[],
  characterPos: Position[][],
  sceneSummaryTexts: SceneSummaryText[],
  characterQuoteBoxes: Box[],
  yShift: number
) => {
  // find scenes that will overlap with the scene overlay using scenePos, save their indices
  const potentialOverlappingScenes = findPotentialOverlappingScenes(
    scenePos,
    baseBox
  );

  // iterating over overlappingScenes, check if any character squares will overlap with the scene overlay using characterPos
  const overlappingScenes = findOverlappingScenes(
    potentialOverlappingScenes,
    sceneCharacters,
    characterScenes,
    characterPos,
    sceneSummaryTexts,
    yShift
  );

  // update scene summary box and text positions
  const new_scene_summary_boxes = [] as SceneSummaryBox[];
  const new_scene_summary_texts = [] as SceneSummaryText[];

  sceneSummaryTexts.forEach((text, i) => {
    const new_box = { ...baseBox };

    if (overlappingScenes.includes(i) || baseBox.x < scene_offset) {
      new_box.x = plotWidth - baseBox.width;
      new_box.y = characterQuoteBoxes[0].y;
    }
    new_scene_summary_boxes.push(new_box);

    const new_text = { ...text };
    if (overlappingScenes.includes(i) || baseBox.x < scene_offset) {
      // also check if there is still any overlap with the character squares

      const characters = sceneCharacters[i].characters;

      let x_translate = new_box.x - new_text.x + 0.9 * character_offset;
      let y_translate = new_box.y - new_text.y + 1.75 * character_offset;

      // see if any characters' y pos will overlap with the scene overlay
      const still_overlap = characters.some((char) => {
        // find index in characterScenes of this scene
        const charIndex = characterScenes.findIndex(
          (c) => c.character === char
        );
        // find index of scene
        const charSceneIndex = characterScenes[charIndex].scenes.findIndex(
          (s) => s === i
        );
        const charPos = characterPos[charIndex][charSceneIndex];
        return (
          charPos &&
          charPos.x > new_box.x - character_offset &&
          charPos.y <
            sceneSummaryTexts[i].height + y_translate + character_offset
        );
      });

      if (still_overlap) {
        // move the text to the left of the plot
        x_translate = -1 * (new_text.x - scene_offset);
        new_box.x = scene_offset - 0.9 * character_offset;

        const box_right_edge = new_box.x + new_box.width + character_offset;

        const shift_y =
          box_right_edge > legendBoxPos.x &&
          box_right_edge < legendBoxPos.x + legendBoxPos.width
            ? legendBoxPos.height + 1.75 * character_offset
            : 0;
        new_box.y = shift_y;
        if (shift_y > 0) {
          new_text.y += shift_y;
          new_text.title_y += shift_y;
          new_text.summary_y += shift_y;
          new_text.location_y += shift_y;
          new_text.divider_y += shift_y;
          new_text.character_y += shift_y;
          new_text.character_list_y += shift_y;
        }
      } else {
        new_text.y += y_translate;
        new_text.title_y += y_translate;
        new_text.summary_y += y_translate;
        new_text.location_y += y_translate;
        new_text.divider_y += y_translate;
        new_text.character_y += y_translate;
        new_text.character_list_y += y_translate;
      }

      new_text.x += x_translate;
      new_text.end_x += x_translate;
    }
    new_scene_summary_texts.push(new_text);
  });

  return {
    scene_summary_boxes: new_scene_summary_boxes,
    scene_summary_texts: new_scene_summary_texts,
  };
};

// color bar positions
const color_bar_pos = (plotWidth: number, scenePos: Position[]) => {
  const num_bars = Object.keys(color_dict).length;
  const width = 1200;
  const gap = 6 / num_bars;
  const section = width / num_bars - gap * 2 * character_offset;
  const y = scenePos[0].y + location_height + 2 * location_offset;
  const total_width =
    section * (num_bars - 1) +
    gap * (num_bars - 1) * num_bars * character_offset;
  const start_offset =
    (plotWidth - num_bars * location_offset - total_width) / 2;
  return Object.keys(color_dict).map((_, i) => {
    return {
      x:
        start_offset +
        location_offset +
        section * i +
        gap * i * num_bars * character_offset,
      // width / (2 + 0.2 * Math.max(0, num_bars - 3)) +
      // 1 +
      // i * section +
      // i * gap * num_bars * character_offset +
      // location_offset,
      y: y,
      width: section,
      height: character_height,
    };
  });
};

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
    if (rating_val === 0) {
      rating_val = 0.05;
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

const getLegendOverlap = (
  scenePos: Position[],
  legendBoxPos: Box,
  sceneCharacters: SceneCharacter[],
  characterScenes: CharacterScene[],
  characterPos: Position[][],
  legendPos: Position[],
  scene_width: number
) => {
  const potentialOverlappingScenes = findPotentialOverlappingScenes(
    scenePos,
    legendBoxPos
  );

  const overlappingScenes = findOverlappingScenes(
    potentialOverlappingScenes,
    sceneCharacters,
    characterScenes,
    characterPos,
    legendBoxPos,
    0
  );

  if (overlappingScenes.length === 0) {
    return 0;
  }

  const all_scene_indices = sceneCharacters.map((_, i) => i);

  const actualOverlappingScenes = findOverlappingScenes(
    all_scene_indices,
    sceneCharacters,
    characterScenes,
    characterPos,
    legendBoxPos,
    0
  );

  // find gap wide enough to fit legend box
  // start from last scene in overlappingScenes and go backwards

  let xShift = 0;
  for (let i = actualOverlappingScenes.length - 1; i > 0; i--) {
    const scene_index = actualOverlappingScenes[i];
    const cur_x = scenePos[scene_index].x;

    let prev_scene_index = actualOverlappingScenes[i - 1];
    let prev_x = scenePos[prev_scene_index].x;

    if (cur_x - prev_x > legendBoxPos.width + 0.75 * scene_width) {
      xShift =
        legendBoxPos.x - (cur_x - 0.75 * scene_width - legendBoxPos.width);
      break;
    }
  }

  // shift legend if xShift is not 0
  if (xShift !== 0) {
    legendBoxPos.x -= xShift;
    legendPos.forEach((pos) => {
      pos.x -= xShift;
    });
  }

  return xShift === 0 ? legendBoxPos.height + character_offset : 0;
};

// get all positions
export const getAllPositions = (
  scene_data: Scene[],
  scenes: string[],
  locations: string[],
  characterScenes: CharacterScene[],
  sceneLocations: string[],
  sceneCharacters: SceneCharacter[],
  location_quotes: LocationQuote[],
  sceneSummaries: SceneSummary[],
  character_quotes: CharacterQuote[],
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
      : characterInfo.charListPos;

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
    sceneWidth,
    characterScenes,
    initCharacterPos,
    initMaxYPerScene,
    sceneCharacters,
    scene_data,
    initScenePos
  );

  const initCharacterPaths = pathInfo.paths;
  const initMaxYPerSceneUpdated = pathInfo.max_y_per_scene;

  // compute max y value of characterPos
  const max_y = Math.max(...initMaxYPerSceneUpdated);

  initScenePos = updateScenePos(initScenePos, max_y);

  const initSceneBoxes = sceneBoxes(
    sceneCharacters,
    initCharacterSquares,
    initScenePos,
    characterScenes
  );

  const initLegendPos = legendPos(plotWidth, sortedCharacters);
  const initLegendBoxPos = legend_box_pos(plotWidth, initLegendPos);

  let yShift = 0;
  if (locations.length < 5) {
    yShift = initLegendBoxPos.height + character_offset;
  } else {
    yShift = getLegendOverlap(
      initScenePos,
      initLegendBoxPos,
      sceneCharacters,
      characterScenes,
      initCharacterPos,
      initLegendPos,
      sceneWidth
    );
  }

  const initLocationQuoteBoxes = location_quote_boxes(
    locations,
    initLocationPos,
    location_quotes
  );

  const initLocationQuoteTexts = location_quote_texts(
    locations,
    initLocationPos,
    location_quotes
  );

  const initCharacterQuoteBoxes = character_quote_boxes(
    characterScenes,
    initLegendBoxPos,
    character_quotes
  );

  const initCharacterQuoteTexts = character_quote_texts(
    characterScenes,
    initCharacterQuoteBoxes,
    character_quotes
  );

  const initColorQuoteBoxes = color_description_boxes(
    initCharacterQuoteBoxes,
    characterScenes,
    sortedCharacters
  );

  const initColorQuoteTexts = color_description_texts(
    characterScenes,
    initColorQuoteBoxes,
    sortedCharacters
  );

  const initSceneSummaryBox = base_scene_summary_box(initLegendBoxPos);

  let initSceneSummaryTexts = scene_summary_texts(
    initSceneSummaryBox,
    scenes,
    sceneSummaries,
    Object.keys(ratingDict).length
  );

  const updatedSceneSummaryPos = update_scene_summaries(
    initLegendBoxPos,
    plotWidth,
    initScenePos,
    initSceneSummaryBox,
    characterScenes,
    sceneCharacters,
    initCharacterPos,
    initSceneSummaryTexts,
    initCharacterQuoteBoxes,
    yShift
  );

  const initSceneSummaryBoxes = updatedSceneSummaryPos.scene_summary_boxes;
  initSceneSummaryTexts = updatedSceneSummaryPos.scene_summary_texts;

  const initColorBarPos = color_bar_pos(plotWidth, initScenePos);

  const plotHeight =
    initColorBarPos[0].y + initColorBarPos[0].height + 8 * character_height;

  const min_conflict_y = max_y + location_buffer;
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
    legendPos: initLegendPos,
    legendBoxPos: initLegendBoxPos,
    locationQuoteBoxes: initLocationQuoteBoxes,
    locationQuoteTexts: initLocationQuoteTexts,
    characterQuoteBoxes: initCharacterQuoteBoxes,
    characterQuoteTexts: initCharacterQuoteTexts,
    colorQuoteBoxes: initColorQuoteBoxes,
    colorQuoteTexts: initColorQuoteTexts,
    sceneSummaryBoxes: initSceneSummaryBoxes,
    sceneSummaryTexts: initSceneSummaryTexts,
    colorBarPos: initColorBarPos,
    conflictPath: initConflictPath,
    importancePath: initImportancePath,
    lengthPath: initLengthPath,
    yShift: yShift,
    minConflictY: min_conflict_y,
  };
};
