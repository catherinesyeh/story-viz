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
const locationPos = (locations: string[]) =>
  locations.map((_, i) => {
    return location_height * i + location_offset;
  });

// compute locations of scene labels
const initialScenePos = (
  scene_width: number,
  scenes: string[],
  scene_data: Scene[],
  locations: string[],
  evenSpacing: boolean
) => {
  let cur_offset = scene_offset;

  const og_plot_width = scene_width * (scenes.length - 1);
  const totalLines = scene_data.reduce((acc, scene, i) => {
    return acc + (i === scene_data.length - 1 ? 0 : scene.numLines);
  }, 0);
  // adjust space between scenes based on number of lines in each scene if !evenSpacing
  const line_increment = evenSpacing ? scene_width : og_plot_width / totalLines;

  return scenes.map((_, i) => {
    const num_lines =
      i === 0 ? 0 : evenSpacing ? 1 : scene_data[i - 1].numLines;
    const next_offset = line_increment * num_lines;
    cur_offset += next_offset;

    return {
      x: cur_offset,
      y: location_height * (locations.length + 0.25),
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
  sceneCharacters: SceneCharacter[]
) =>
  characterScenes.map((character) => {
    return character.scenes.map((scene) => {
      return {
        x: initialScenePos[scene].x - 0.5 * character_height,
        y:
          locationPos[locations.indexOf(sceneLocations[scene])] +
          location_offset * 0.5 +
          character_offset *
            sceneCharacters[scene].characters.indexOf(character.character),
      };
    });
  });

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

const getPath = (
  character: CharacterScene,
  character_coords_arr: number[][],
  scene_width: number,
  og_max_y_per_scene: number[],
  old_max_y_per_scene: number[],
  sceneCharacters: SceneCharacter[],
  scenePos: Position[],
  characterScenes: CharacterScene[],
  characterPos: Position[][]
) => {
  const adjustments = {} as Record<number, number>;
  const max_y_per_scene = [...old_max_y_per_scene];
  const og_indices = [] as number[];
  const charScenes = character.scenes;
  // add point to the character's path at the start of the story
  character_coords_arr.unshift([
    character_coords_arr[0][0] - scene_base / 2,
    character_coords_arr[0][1],
  ]);

  // add point to the character's path at the end of the story
  character_coords_arr.push([
    character_coords_arr[character_coords_arr.length - 1][0] + scene_base / 2,
    character_coords_arr[character_coords_arr.length - 1][1],
  ]);
  // add intermediate points if there is a gap in characters' appearance
  let j = 0; // corresponds to cur char scene index
  let old_j = -1; // corresponds to prev char scene index
  for (let i = 1; i < character_coords_arr.length; i++) {
    const cur_x = character_coords_arr[i][0];
    const prev_x = character_coords_arr[i - 1][0];
    const cur_y = character_coords_arr[i][1];
    const prev_y = character_coords_arr[i - 1][1];

    const scene_index = charScenes[j];
    const prev_scene_index = charScenes[old_j] + 1;

    // find max_y for all scenes between prev_scene_index and scene_index
    const cur_max_y =
      scene_index === prev_scene_index
        ? max_y_per_scene[scene_index]
        : Math.max(...max_y_per_scene.slice(prev_scene_index, scene_index));
    const cur_max_indices = max_y_per_scene
      .map((_, i) => i)
      .filter((val) => max_y_per_scene[val] === cur_max_y);

    const og_cur_max_y = Math.max(
      ...og_max_y_per_scene.slice(prev_scene_index, scene_index)
    );

    // see if there's a character below this character in the same scene
    // using sceneCharacters
    const sceneChars = sceneCharacters[scene_index]
      ? sceneCharacters[scene_index].characters
      : [];
    const numPrevChars = sceneChars.indexOf(character.character);
    const numNextChars = sceneChars.length - numPrevChars - 1;

    const prevSceneChars = sceneCharacters[charScenes[old_j]]
      ? sceneCharacters[charScenes[old_j]].characters
      : [];
    const prevNumPrevChars = prevSceneChars.indexOf(character.character);
    const prevNumNextChars =
      prevNumPrevChars === -1
        ? prevNumPrevChars
        : prevSceneChars.length - prevNumPrevChars - 1;

    const gap = charScenes[j] - charScenes[old_j];

    let horizontalPath = gap > 1 && Math.abs(cur_y - prev_y) < character_offset; // can draw a horizontal line if true

    if (horizontalPath) {
      // double check if there's overlap betwene scenes with the same y value
      const between_scenes = sceneCharacters.slice(
        prev_scene_index,
        scene_index
      );

      between_scenes.forEach((scene) => {
        const chars = scene.characters;

        // collect any chars from prev_scene_index that are in this scene
        const overlappingCharsPrev = prevSceneChars.filter((c) =>
          chars.includes(c)
        );

        overlappingCharsPrev.forEach((char) => {
          const charIndex = characterScenes.findIndex(
            (c) => c.character === char
          );
          const sceneIndex = sceneCharacters.indexOf(scene);
          const charInSceneIndex = prevSceneChars.indexOf(char);
          const charPos = characterPos[charIndex][sceneIndex];

          if (
            charPos &&
            charInSceneIndex < numPrevChars &&
            charPos.y > prev_y
          ) {
            horizontalPath = false;
            return;
          } else if (
            charPos &&
            charInSceneIndex > numPrevChars &&
            charPos.y < prev_y
          ) {
            horizontalPath = false;
            return;
          }
        });

        // collect any chars from current scene (outside of between_scenes range) that are in this scene
        const overlappingCharsCur = sceneChars.filter((c) => chars.includes(c));

        overlappingCharsCur.forEach((char) => {
          const charIndex = characterScenes.findIndex(
            (c) => c.character === char
          );
          const sceneIndex = sceneCharacters.indexOf(scene);
          const charInSceneIndex = sceneChars.indexOf(char);
          const charPos = characterPos[charIndex][sceneIndex];

          if (charPos && charInSceneIndex < numPrevChars && charPos.y > cur_y) {
            horizontalPath = false;
            return;
          } else if (
            charPos &&
            charInSceneIndex > numPrevChars &&
            charPos.y < cur_y
          ) {
            horizontalPath = false;
            return;
          }
        });

        // now look for characters in the previous scene that are in this scene
        let otherChar = chars[numPrevChars];

        if (chars.length - 1 < numPrevChars) {
          otherChar = chars[chars.length - 1];
        }

        // get position of other character
        const otherCharIndex = characterScenes.findIndex(
          (c) => c.character === otherChar
        );

        const otherSceneIndex = sceneCharacters.indexOf(scene);
        const otherSceneInCharIndex =
          characterScenes[otherCharIndex].scenes.indexOf(otherSceneIndex);
        const otherCharPos =
          characterPos[otherCharIndex][otherSceneInCharIndex];

        // get all characters in this scene
        if (numPrevChars > 0) {
          const prevChars = sceneCharacters[prev_scene_index - 1].characters;
          const curChars = sceneCharacters[scene_index].characters;
          const prevInd = prevChars[prevChars.indexOf(character.character) - 1];
          const curInd = curChars[curChars.indexOf(character.character) - 1];
          const samePrev = prevInd === curInd && chars.includes(prevInd);

          if (
            (samePrev && otherCharPos.y >= cur_y) ||
            Math.abs(otherCharPos.y - cur_y) < character_offset
          ) {
            horizontalPath = false;
            return;
          }
        } else {
          // numPrevChars === 0
          if (Math.abs(otherCharPos.y - cur_y) < character_offset) {
            horizontalPath = false;
            return;
          }
        }
      });
    }

    // gap (1+ scene)
    if (gap > 1) {
      // calculate width of leftmost and rightmost scenes in gap
      const prev_width =
        scenePos[prev_scene_index].x - scenePos[prev_scene_index - 1].x;
      const next_width = scenePos[scene_index].x - scenePos[scene_index - 1].x;
      const avg_width = // avg width of all scenes in gap
        (scenePos[scene_index].x - scenePos[prev_scene_index - 1].x) / gap;

      let prev_base = Math.max(prev_width, avg_width);
      let next_base = Math.max(next_width, avg_width);

      // big gap (2+ scenes) -- add two points
      if (gap > 2) {
        const new_max_y = cur_max_y;

        let prev_multiplier = prev_base * 0.5;
        let next_multiplier = next_base * 0.5;

        if (horizontalPath) {
          character_coords_arr.splice(i, 0, [prev_x + prev_multiplier, cur_y]);

          character_coords_arr.splice(i + 1, 0, [
            cur_x - next_multiplier,
            cur_y,
          ]);
        } else {
          let new_y = Math.max(new_max_y + character_offset, cur_y, prev_y);
          if (new_y - og_cur_max_y < character_offset) {
            new_y += 0.5 * character_offset;
          }

          if (cur_y - prev_y > location_buffer) {
            // moving down
            if (cur_y > og_cur_max_y) {
              // don't need to go all the way down
              new_y = cur_y;
            } else {
              const max_of_maxes =
                cur_max_y - og_cur_max_y > location_buffer
                  ? og_cur_max_y + character_height
                  : cur_max_y;
              new_y = max_of_maxes + character_offset;
            }
          } else if (prev_y - cur_y > location_buffer) {
            // moving up
            if (prev_y > og_cur_max_y) {
              new_y = prev_y;
            } else {
              const max_of_maxes =
                cur_max_y - og_cur_max_y > location_buffer
                  ? og_cur_max_y + character_height
                  : cur_max_y;
              new_y = max_of_maxes + character_offset;
            }
          }

          if (new_y === cur_y) {
            // only 1 point added
            character_coords_arr.splice(i, 0, [
              prev_x + prev_multiplier + numNextChars * character_offset,
              new_y,
            ]);
            character_coords_arr.splice(i + 1, 0, [
              cur_x - next_multiplier,
              cur_y,
            ]);
          } else if (new_y === prev_y) {
            // only 1 point added
            character_coords_arr.splice(i, 0, [
              prev_x + prev_multiplier,
              prev_y,
            ]);
            character_coords_arr.splice(i + 1, 0, [
              cur_x - next_multiplier - numNextChars * character_offset,
              new_y,
            ]);
          } else {
            // add two points

            const offset =
              Math.abs(new_y - cur_y) > 2 * location_buffer
                ? 0
                : numNextChars * character_offset;
            character_coords_arr.splice(i, 0, [
              prev_x + prev_multiplier + offset,
              new_y,
            ]);

            character_coords_arr.splice(i + 1, 0, [
              cur_x - next_multiplier - offset,
              new_y,
            ]);
          }

          // update max_y_per_scene between prev_scene_index and scene_index
          for (let j = prev_scene_index; j < scene_index; j++) {
            max_y_per_scene[j] = new_y;
          }
          if (new_y - cur_y > 3 * location_buffer && numNextChars !== 0) {
            adjustments[i + 2] = 2 * numNextChars;
          } else if (
            new_y - cur_y > 2.5 * location_buffer &&
            numNextChars === 0 &&
            cur_x - prev_x > scene_width * 5
          ) {
            adjustments[i + 2] = 1.5 * numPrevChars;
          }
        }
      } else {
        // small gap (1 scene) -- add one point
        if (horizontalPath) {
          character_coords_arr.splice(i, 0, [prev_x + prev_base * 0.5, cur_y]);
          character_coords_arr.splice(i + 1, 0, [
            cur_x - next_base * 0.5,
            cur_y,
          ]);
        } else {
          if (
            (cur_y - prev_y > location_buffer && numPrevChars === 0) ||
            (prev_y - cur_y < location_buffer &&
              prev_y - cur_y > 2 * character_height &&
              prev_y > og_cur_max_y)
          ) {
            // if character is moving down or small up gap
            let new_y = prev_y;
            if (
              prev_y <= og_cur_max_y + character_offset &&
              (numPrevChars > 0 || prevNumPrevChars > 0) &&
              numNextChars !== 0 &&
              prevNumNextChars !== 0
            ) {
              new_y += 0.75 * character_offset;
            }
            let next_multiplier = next_base * 0.75;
            character_coords_arr.splice(i, 0, [
              prev_x + prev_base * 0.5,
              new_y,
            ]);
            character_coords_arr.splice(i + 1, 0, [
              cur_x - next_multiplier - numNextChars * character_offset,
              new_y,
            ]);

            if (i === character_coords_arr.length - 4) {
              adjustments[i + 2] = -0.75;
            }
          } else if (
            (prev_y - cur_y > location_buffer &&
              numPrevChars === 0 &&
              prevNumPrevChars === 0) ||
            (cur_y - prev_y < location_buffer &&
              cur_y - prev_y > 2 * character_height &&
              cur_y > og_cur_max_y)
          ) {
            // if character is moving up or small down gap
            let new_y = cur_y;
            if (
              cur_y <= og_cur_max_y + character_offset &&
              (numNextChars > 0 || prevNumNextChars > 0) &&
              numPrevChars !== 0 &&
              prevNumPrevChars !== 0
            ) {
              new_y += 0.75 * character_offset;
            }
            let prev_multiplier = prev_base * 0.75;
            character_coords_arr.splice(i, 0, [
              prev_x + prev_multiplier + numNextChars * character_offset,
              new_y,
            ]);
            character_coords_arr.splice(i + 1, 0, [
              cur_x - next_base * 0.5,
              new_y,
            ]);
          } else {
            // if character is moving horizontally or really small gap

            // don't need to go all the way down
            let new_y = cur_max_y + character_offset;
            if (
              (prev_y > cur_y && prev_y > og_cur_max_y) ||
              prevNumPrevChars === 0
            ) {
              new_y = prev_y;
            } else if (
              (cur_y > prev_y && cur_y > og_cur_max_y) ||
              numPrevChars === 0
            ) {
              new_y = cur_y;
            }

            // if (!horizontalPath) {
            //   new_y = cur_max_y + 0.75 * character_offset;
            // }

            // if (!(prev_y === cur_y && prev_y === new_y)) {
            if (prev_y === new_y && !(new_y === cur_y)) {
              // add one point
              character_coords_arr.splice(i, 0, [
                prev_x + prev_base * 0.5,
                new_y,
              ]);
              character_coords_arr.splice(i + 1, 0, [
                cur_x - next_base * 0.5,
                new_y,
              ]);
            } else if (cur_y === new_y && !(prev_y === new_y)) {
              // add one point
              character_coords_arr.splice(i, 0, [
                prev_x + prev_base * 0.5,
                new_y,
              ]);
              character_coords_arr.splice(i + 1, 0, [
                cur_x - next_base * 0.5,
                new_y,
              ]);
            } else {
              // add two points
              character_coords_arr.splice(i, 0, [
                prev_x + prev_base * 0.5,
                new_y,
              ]);
              character_coords_arr.splice(i + 1, 0, [
                cur_x - next_base * 0.5,
                new_y,
              ]);
            }

            // update max_y_per_scene between prev_scene_index and scene_index
            cur_max_indices.forEach((j) => {
              max_y_per_scene[j] = new_y;
            });
          }
        }
      }
      // }
      i += 2;
    } else {
      // width of gap
      const width = cur_x - prev_x;
      // compare to scene_width
      const factor = Math.max(width / scene_width, 1);

      if (numPrevChars === 0) {
        if (
          cur_y > prev_y &&
          cur_y - prev_y > location_buffer &&
          numNextChars > 0
        ) {
          // if character is moving down
          adjustments[i] = -0.25;
        } else if (
          prev_y > cur_y &&
          prev_y - cur_y > location_buffer &&
          prevNumNextChars > 0 &&
          prevNumPrevChars !== 0
        ) {
          // if character is moving up
          adjustments[i] = 0.25;
        } else if (
          prev_y > cur_y &&
          prev_y - cur_y < location_buffer &&
          numNextChars === 1 &&
          numNextChars === prevNumNextChars &&
          sceneChars[numPrevChars + 1] === prevSceneChars[numPrevChars + 1] &&
          cur_x - prev_x > location_buffer
        ) {
          // find next character in scene
          const next_char = sceneChars[numPrevChars + 1];
          // see if prev scene is the first scene with the next character
          const next_char_scenes = characterScenes.find(
            (c) => c.character === next_char
          )?.scenes;
          if (
            next_char_scenes &&
            next_char_scenes[0] === prev_scene_index - 1
          ) {
            // if character is moving up
            adjustments[i] = 0.75;
          }
        }
      } else if (
        cur_y > prev_y &&
        prevNumPrevChars > 0 &&
        ((i < character_coords_arr.length - 2 &&
          cur_y - prev_y > location_buffer) ||
          (cur_y - prev_y < location_buffer &&
            ((prevNumPrevChars === numPrevChars &&
              i !== character_coords_arr.length - 2) ||
              (prevNumPrevChars !== numPrevChars &&
                i === character_coords_arr.length - 2 &&
                character_coords_arr.length < 5))))
      ) {
        // if character is moving down
        adjustments[i] = -1 * factor * prevNumPrevChars;

        if (i === 2 && i !== character_coords_arr.length - 2) {
          adjustments[i] /= 2;
        }
      } else if (
        prev_y > cur_y &&
        numPrevChars > 0 &&
        ((i < character_coords_arr.length - 2 &&
          prev_y - cur_y > location_buffer) ||
          (prev_y - cur_y < location_buffer &&
            ((prevNumPrevChars === numPrevChars &&
              i !== character_coords_arr.length - 2) ||
              (prevNumPrevChars !== numPrevChars &&
                i === character_coords_arr.length - 2 &&
                character_coords_arr.length < 5))))
      ) {
        // if character is moving up
        adjustments[i] = factor * numPrevChars;
        if (i == 2 && i !== character_coords_arr.length - 2) {
          adjustments[i] *= 1.25;
        } else if (
          i === character_coords_arr.length - 3 &&
          prev_y - cur_y > location_buffer &&
          prevNumPrevChars !== 0
        ) {
          adjustments[i] += 0.5;
        } else if (numNextChars > 0 && prev_y - cur_y > 2 * location_buffer) {
          adjustments[i] /= 4 * numNextChars;
        }
      }
    }

    og_indices.push(i);
    old_j = j;
    j += 1;
  }

  // check if all points have same y value; if so, move 1st point up by 0.001
  const same_y = character_coords_arr.every(
    (val, _, arr) => val[1] === arr[0][1]
  );
  if (same_y) {
    character_coords_arr[0][1] -= 0.0001;
    // move last point up by 0.001
    character_coords_arr[character_coords_arr.length - 1][1] -= 0.0001;
  }

  return {
    coords: character_coords_arr,
    max_y_per_scene: max_y_per_scene,
    adjustments: adjustments,
    og_indices: og_indices,
  };
};

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

const characterPaths = (
  scene_width: number,
  characterScenes: CharacterScene[],
  characterPos: Position[][],
  max_y_per_scene: number[],
  sceneCharacters: SceneCharacter[],
  scene_data: Scene[],
  scenePos: Position[]
) => {
  const og_max_y_per_scene = [...max_y_per_scene];
  let updated_max_y_per_scene = [...max_y_per_scene];

  const allPaths = characterScenes.map((character) => {
    // console.log(character.character);
    const paths = [];

    const character_coords = characterPos[characterScenes.indexOf(character)];

    const importance_weights = character.scenes.map((scene) => {
      const importance = scene_data[scene].characters.find(
        (c) => c.name === character.character
      )?.importance as number;

      return normalizeMarkerSize(character_height * importance) / 2;
    });

    let character_coords_arr = character_coords.map((pos) => [
      pos.x + character_height / 2,
      pos.y + character_height / 2,
    ]);

    const coord_info = getPath(
      character,
      character_coords_arr,
      scene_width,
      og_max_y_per_scene,
      updated_max_y_per_scene,
      sceneCharacters,
      scenePos,
      characterScenes,
      characterPos
    );
    updated_max_y_per_scene = coord_info.max_y_per_scene;
    const og_indices = coord_info.og_indices;
    const adjustments = coord_info.adjustments;

    const character_coords_top = character_coords_arr.map((point, i) => {
      if (i === 0) {
        return [point[0], point[1] - importance_weights[0]];
      } else if (i === character_coords_arr.length - 1) {
        return [
          point[0],
          point[1] - importance_weights[importance_weights.length - 1],
        ];
      } else if (!og_indices.includes(i)) {
        return [point[0], point[1] - 0.5];
      }
      const ind = og_indices.findIndex((val) => val === i);
      return [point[0], point[1] - importance_weights[ind]];
    });
    const character_coords_bottom = character_coords_arr.map((point, i) => {
      if (i === 0) {
        return [point[0], point[1] + importance_weights[0]];
      } else if (i === character_coords_arr.length - 1) {
        return [
          point[0],
          point[1] + importance_weights[importance_weights.length - 1],
        ];
      } else if (!og_indices.includes(i)) {
        return [point[0], point[1] + 0.5];
      }
      const ind = og_indices.findIndex((val) => val === i);
      return [point[0], point[1] + importance_weights[ind]];
    });
    // console.log(adjustments);
    let top_path = svgPath(character_coords_top, adjustments, bezierCommand);
    let bottom_path = svgPath(
      character_coords_bottom,
      adjustments,
      bezierCommand
    );

    let bottom_path_reversed = reverseSvgPath(bottom_path);

    const right_join_point = bottom_path_reversed.split(" C ")[0].split(",")[1];

    const left_join_point = top_path.split(" C ")[0].split(",")[1];

    const full_path =
      top_path +
      " V " +
      right_join_point +
      " " +
      bottom_path_reversed +
      " V " +
      left_join_point;

    paths.push(full_path);

    return paths;
  });

  return {
    paths: allPaths,
    max_y_per_scene: updated_max_y_per_scene,
  };
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
    const firstChar = characterScenes.findIndex(
      (c) => c.character === characters[0]
    );
    const firstCharScene = characterScenes[firstChar].scenes.findIndex(
      (s) => s === i
    );
    const lastChar = characterScenes.findIndex(
      (c) => c.character === characters[characters.length - 1]
    );
    const lastCharScene = characterScenes[lastChar].scenes.findIndex(
      (s) => s === i
    );

    const top = characterSquares[firstChar][firstCharScene].y;
    const bottom =
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

  const numRows = Math.round(characters.length / 5);

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
  return Object.keys(color_dict).map((_, i) => {
    const width = (plotWidth - 2 * location_offset) / 2 + 1;
    const gap = 6 / num_bars;
    const section = width / num_bars - gap * 2 * character_offset;
    const y = scenePos[0].y + location_height + 2 * location_offset;
    return {
      x:
        width / (2 + 0.2 * Math.max(0, num_bars - 3)) +
        1 +
        i * section +
        i * gap * num_bars * character_offset +
        location_offset,
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
) =>
  ratings.map((rating, i) => {
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

// compute overlay curve
const overlayPath = (conflict_points: Position[], min_conflict_y: number) => {
  const overlay_coords = conflict_points.map((point: any) => [
    point.x + character_height / 2 - 5,
    point.y + character_height / 2,
  ]);

  const path = svgPath(overlay_coords, {}, bezierCommand, 0.3);

  // add a point at the beginning and end of the curve to close it off
  const start = [overlay_coords[0][0], min_conflict_y];
  const end = [overlay_coords[overlay_coords.length - 1][0], min_conflict_y];

  const edited_path = path.replace("M", "M" + start[0] + "," + start[1] + " L");
  return edited_path + " L " + end[0] + "," + end[1];
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
  ratingDict: RatingDict
) => {
  const sceneWidth = scene_width(locations, scenes);

  const initLocationPos = locationPos(locations);
  let initScenePos = initialScenePos(
    sceneWidth,
    scenes,
    scene_data,
    locations,
    evenSpacing
  );

  const plotWidth = plot_width(initScenePos);

  const initCharacterPos = characterPos(
    characterScenes,
    initScenePos,
    initLocationPos,
    locations,
    sceneLocations,
    sceneCharacters
  );

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

  const initConflictPath = overlayPath(initConflictPoints, min_conflict_y);

  const initImportancePoints = overlay_points(
    ratingDict.importance,
    min_conflict_y,
    initScenePos
  );
  const initImportancePath = overlayPath(initImportancePoints, min_conflict_y);

  const initLengthPoints = overlay_points(
    ratingDict.length,
    min_conflict_y,
    initScenePos
  );
  const initLengthPath = overlayPath(initLengthPoints, min_conflict_y);

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
