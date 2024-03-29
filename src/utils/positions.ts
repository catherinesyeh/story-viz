import { color_dict } from "./colors";
import { bezierCommand, svgPath } from "./curve";
import {
  normalizeRating,
  normalizeMarkerSize,
  getStringWidth,
} from "./helpers";

import {
  location_height,
  location_offset,
  scene_offset,
  character_height,
  character_offset,
  scene_base,
  plot_width,
  scene_width,
} from "./consts";
import {
  CharacterQuote,
  CharacterScene,
  LocationQuote,
  Scene,
  SceneCharacter,
  SceneSummary,
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
  mid_x: number;
  end_x: number;
  third: number;
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
  locations: string[]
) =>
  scenes.map((_, i) => {
    return {
      x: scene_width * i + scene_offset,
      y: location_height * (locations.length + 0.25),
    };
  });

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
          locationPos[locations.indexOf(sceneLocations[scene])] -
          0.6 * location_offset +
          character_offset *
            sceneCharacters[scene].characters.indexOf(character.character),
      };
    });
  });

// compute character square positions
const characterSquares = (
  characterScenes: CharacterScene[],
  initialScenePos: Position[],
  locationPos: number[],
  locations: string[],
  sceneLocations: string[],
  sceneCharacters: SceneCharacter[],
  scene_data: Scene[]
) =>
  characterScenes.map((character) => {
    return character.scenes.map((scene) => {
      const importance = scene_data[scene].characters.find(
        (c) => c.name === character.character
      )?.importance as number;

      const normalized_importance = normalizeMarkerSize(
        character_height * importance
      );
      return {
        x: initialScenePos[scene].x - 0.5 * normalized_importance,
        y:
          locationPos[locations.indexOf(sceneLocations[scene])] +
          2 * (1 - importance) -
          0.6 * location_offset +
          character_offset *
            sceneCharacters[scene].characters.indexOf(character.character),
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

const characterPaths = (
  scene_width: number,
  characterScenes: CharacterScene[],
  characterPos: Position[][],
  max_y_per_scene: number[],
  scenes: string[],
  locations: string[],
  sceneCharacters: SceneCharacter[]
) => {
  const allPaths = characterScenes.map((character) => {
    const paths = [];

    const character_coords = characterPos[characterScenes.indexOf(character)];
    // convert to array of arrays, adjust for character height
    const character_coords_arr = character_coords.map((pos: any) => [
      pos.x + character_height / 2,
      pos.y + character_height / 2,
    ]);

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

    // add intermediate points if there is a gap of 3+ scenes
    for (let i = 1; i < character_coords_arr.length; i++) {
      const cur_x = character_coords_arr[i][0];
      const prev_x = character_coords_arr[i - 1][0];
      const cur_y = character_coords_arr[i][1];
      const prev_y = character_coords_arr[i - 1][1];

      const scene_index = Math.floor((cur_x - scene_offset) / scene_width);
      const prev_scene_index =
        Math.floor((prev_x - scene_offset) / scene_width) + 1;
      // find max_y for all scenes between prev_scene_index and scene_index
      const cur_max_y = Math.max(
        ...max_y_per_scene.slice(prev_scene_index, scene_index)
      );

      // see if there's a character below this character in the same scene
      // using sceneCharacters
      const sceneChars = sceneCharacters[scene_index].characters;
      const charInd = sceneChars.indexOf(character.character);
      const nextChar = sceneChars[charInd + 1];

      const real_prev_ind = prev_scene_index - 1;
      const prevSceneChars =
        real_prev_ind > -1 && real_prev_ind < scenes.length - 1
          ? sceneCharacters[real_prev_ind].characters
          : [];
      const prevCharInd = prevSceneChars.indexOf(character.character);
      const prevChar = prevSceneChars[prevCharInd + 1];

      const scene_buffer = scene_width + character_offset;

      if (cur_x - prev_x > scene_buffer) {
        if (cur_x - prev_x > scene_buffer * 2) {
          const max_cur_y =
            cur_y +
            Math.ceil(
              (location_height * (locations.length - 1) - cur_y) /
                location_height
            ) *
              location_height;
          const max_prev_y =
            prev_y +
            Math.ceil(
              (location_height * (locations.length - 1) - prev_y) /
                location_height
            ) *
              location_height;

          const gap_size = Math.ceil((cur_x - prev_x) / scene_width);
          const offset = gap_size > 4 ? 0.5 : 0.75;

          const new_y =
            Math.max(
              max_cur_y - character_offset,
              max_prev_y - character_offset,
              cur_max_y
            ) + character_offset;

          if (prevChar) {
            character_coords_arr.splice(i, 0, [
              prev_x + scene_width * offset + character_offset / offset,
              new_y,
            ]);
          } else {
            character_coords_arr.splice(i, 0, [
              prev_x + scene_width * offset,
              new_y,
            ]);
          }
          if (nextChar) {
            character_coords_arr.splice(i + 1, 0, [
              cur_x - scene_width * offset - character_offset / offset,
              new_y,
            ]);
          } else {
            // big gap so add two points
            character_coords_arr.splice(i + 1, 0, [
              cur_x - scene_width * offset,
              new_y,
            ]);
          }
          // update max_y_per_scene between prev_scene_index and scene_index
          for (let j = prev_scene_index; j < scene_index; j++) {
            max_y_per_scene[j] = new_y;
          }

          i += 2;
        } else {
          if (cur_y > prev_y && cur_y - prev_y > location_height) {
            // if character is moving down
            character_coords_arr.splice(i, 0, [
              cur_x - scene_width * 0.75,
              prev_y,
            ]);
            i += 1;
          } else if (cur_y < prev_y && prev_y - cur_y > location_height) {
            // if character is moving up
            character_coords_arr.splice(i, 0, [
              prev_x + scene_width * 0.75,
              cur_y,
            ]);
            i += 1;
          } else {
            // if character is moving horizontally
            const max_cur_y =
              cur_y +
              Math.ceil(
                (location_height * (locations.length - 1) - cur_y) /
                  location_height
              ) *
                location_height;
            const max_prev_y =
              prev_y +
              Math.ceil(
                (location_height * (locations.length - 1) - prev_y) /
                  location_height
              ) *
                location_height;

            const new_y =
              Math.max(
                max_cur_y - character_offset,
                max_prev_y - character_offset,
                cur_max_y
              ) + character_offset;

            // add two points
            character_coords_arr.splice(i, 0, [
              prev_x + scene_width * 0.5,
              new_y,
            ]);
            character_coords_arr.splice(i + 1, 0, [
              cur_x - scene_width * 0.5,
              new_y,
            ]);

            // update max_y_per_scene between prev_scene_index and scene_index
            for (let j = prev_scene_index; j < scene_index; j++) {
              max_y_per_scene[j] = new_y;
            }

            i += 2;
          }
        }
      }
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

    paths.push(svgPath(character_coords_arr, bezierCommand));
    return paths;
  });

  return {
    paths: allPaths,
    max_y_per_scene: max_y_per_scene,
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
      x: scenePos[i].x - scene_base / character_height,
      y: top - 0.75 * character_height,
      width: 2 * character_height,
      height: bottom - top + 1.5 * character_height,
    };
  });

// compute pos of legend items
const legendPos = (characterScenes: CharacterScene[], plotWidth: number) => {
  // get characterNames from characterScenes
  const characters = characterScenes.map((char) => char.character);

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
    max_lengths[max_lengths.length - 1] * 4 + 2.5 * character_offset;

  let all_pos = [] as Position[];

  // compute positions for each character
  groups.reverse().forEach((group, i) => {
    const my_offset = legend_offset;
    group.forEach((_, j) => {
      const x_offset = plotWidth - my_offset;
      const y_offset =
        location_offset * 0.6 +
        (group.length - j - 1) * 1.75 * character_height;

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
      3 * factor * character_offset;
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
    x: min_x - 1.25 * character_offset,
    y: 0,
    width: plotWidth - min_x + 1.25 * character_offset,
    height: max_y + 1.75 * character_offset,
  };
};

// location quote box positions
const location_quote_boxes = (
  locations: string[],
  locationPos: number[],
  location_quotes: LocationQuote[]
) =>
  locations.map((_, i) => {
    return {
      x: scene_offset - 1.25 * location_offset,
      y: locationPos[locationPos.length - 2] - location_offset,
      width: scene_base * 5 - character_offset,
      height: (location_quotes[i].quote.length + 3) * character_offset,
    };
  });

// location quote text positions
const location_quote_texts = (
  locations: string[],
  locationPos: number[],
  location_quotes: LocationQuote[]
) =>
  locations.map((_, i) => {
    return location_quotes[i].quote.map((_, j) => {
      return {
        x: scene_offset - 0.5 * location_offset,
        y: locationPos[locationPos.length - 2] + (j + 1.2) * character_offset,
      };
    });
  });

// character quote box positions
const character_quote_boxes = (
  characterScenes: CharacterScene[],
  legend_box_pos: Box,
  character_quotes: CharacterQuote[]
) =>
  characterScenes.map((_, i) => {
    return {
      x: legend_box_pos.x,
      y: legend_box_pos.y + legend_box_pos.height + 3 * character_height,
      width: scene_base * 5.5 + character_offset,
      height:
        (Math.max(character_quotes[i].quote.length, 2) + 3) * character_offset,
    };
  });

// character quote text positions
const character_quote_texts = (
  characterScenes: CharacterScene[],
  character_quote_boxes: Box[],
  legend_box_pos: Box,
  character_quotes: CharacterQuote[]
) =>
  characterScenes.map((_, i) => {
    return character_quotes[i].quote.map((_, j) => {
      return {
        x: legend_box_pos.x + 0.75 * location_offset + 0.55 * location_height,
        y: character_quote_boxes[i].y + (j + 2.8) * character_offset,
      };
    });
  });

// scene quote box positions
const base_scene_summary_box = (legendBoxPos: Box) => {
  const width = scene_base * 8.25;
  return {
    x: legendBoxPos.x - width - 3 * character_height,
    y: 0,
    width: width,
  } as SceneSummaryBox;
};

const scene_summary_texts = (
  scene_summary_boxes: SceneSummaryBox,
  scenes: string[],
  sceneSummaries: SceneSummary[]
) =>
  scenes.map((_, i) => {
    const start_x = scene_summary_boxes.x + 1.2 * character_offset;
    const end_x = start_x + scene_summary_boxes.width - 1.5 * location_offset;
    const third = (end_x - start_x) / 3 - 0.8 * character_offset;

    let start_y = 2 * character_offset;
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
      1.2 * character_offset;

    return {
      x: start_x,
      mid_x: (start_x + end_x) / 2,
      end_x: end_x,
      third: third,
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

// update scene summary box and text positions
const update_scene_summaries = (
  plotWidth: number,
  scenePos: Position[],
  baseBox: SceneSummaryBox,
  sceneCharacters: SceneCharacter[],
  characterPos: Position[][],
  sceneSummaryTexts: SceneSummaryText[],
  characterQuoteBoxes: Box[]
) => {
  // find scenes that will overlap with the scene overlay using scenePos, save their indices
  const potentialOverlappingScenes = scenePos.reduce(
    (acc: number[], pos, i) => {
      if (pos.x > baseBox.x && pos.x < baseBox.x + baseBox.width) {
        acc.push(i);
      }
      return acc;
    },
    []
  );

  // iterating over overlappingScenes, check if any character squares will overlap with the scene overlay using characterPos
  const overlappingScenes = potentialOverlappingScenes.reduce(
    (acc: number[], sceneIndex) => {
      const characters = sceneCharacters[sceneIndex].characters;

      // see if any characters' y pos will overlap with the scene overlay
      characters.some((_, i) => {
        const charPos = characterPos[i][sceneIndex];
        if (charPos && charPos.y < sceneSummaryTexts[sceneIndex].height) {
          acc.push(sceneIndex);
          return true;
        }
        return false;
      });

      return acc;
    },
    []
  );

  // update scene summary box and text positions
  const new_scene_summary_boxes = [] as SceneSummaryBox[];
  const new_scene_summary_texts = [] as SceneSummaryText[];

  sceneSummaryTexts.forEach((text, i) => {
    const new_box = { ...baseBox };

    if (overlappingScenes.includes(i)) {
      new_box.x = plotWidth - baseBox.width;
      new_box.y = characterQuoteBoxes[0].y;
    }
    new_scene_summary_boxes.push(new_box);

    const new_text = { ...text };
    if (overlappingScenes.includes(i)) {
      const x_translate = new_box.x - new_text.x + 1.2 * character_offset;
      new_text.x += x_translate;
      new_text.end_x += x_translate;
      new_text.mid_x += x_translate;

      const y_translate = new_box.y - new_text.y + 2 * character_offset;
      new_text.y += y_translate;
      new_text.title_y += y_translate;
      new_text.summary_y += y_translate;
      new_text.location_y += y_translate;
      new_text.divider_y += y_translate;
      new_text.character_y += y_translate;
      new_text.character_list_y += y_translate;
    }
    new_scene_summary_texts.push(new_text);
  });

  return {
    scene_summary_boxes: new_scene_summary_boxes,
    scene_summary_texts: new_scene_summary_texts,
  };
};

// color bar positions
const color_bar_pos = (plotWidth: number, scenePos: Position[]) =>
  Object.keys(color_dict).map((_, i) => {
    const width = (plotWidth - 2 * location_offset) / 2 + 2;
    const gap = 2;
    const third = width / 3 - gap * 2 * character_offset;
    const y = scenePos[0].y + location_height + 2 * location_offset;
    return {
      x:
        width / 2 +
        2 +
        i * third +
        i * gap * 3 * character_offset +
        location_offset,
      y: y,
      width: third,
      height: character_height,
    };
  });

// compute conflict curve positions based on conflict rating of each scene
const conflict_points = (
  scene_data: Scene[],
  min_conflict_y: number,
  scenePos: Position[]
) =>
  scene_data.map((scene, i) => {
    // for each scene, compute the x and y coordinates for the curve
    const x = scenePos[i].x;
    // y should be between min_conflict_y and 0 (max conflict)
    const conflict = normalizeRating(scene.ratings.conflict);
    const y = min_conflict_y - conflict * min_conflict_y;
    return { x: x, y: y };
  });

// compute conflict curve
const conflictPath = (conflict_points: Position[], scenePos: Position[]) => {
  const conflict_coords = conflict_points.map((point: any) => [
    point.x + character_height / 2 - 5,
    point.y + character_height / 2,
  ]);

  const path = svgPath(conflict_coords, bezierCommand);

  // add a point at the beginning and end of the curve to close it off
  const start = [conflict_coords[0][0], scenePos[0].y - 0.75 * location_offset];
  const end = [
    conflict_coords[conflict_coords.length - 1][0],
    scenePos[scenePos.length - 1].y - 0.75 * location_offset,
  ];

  const edited_path = path.replace("M", "M" + start[0] + "," + start[1] + " L");
  return edited_path + " L " + end[0] + "," + end[1];
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
  character_quotes: CharacterQuote[]
) => {
  const sceneWidth = scene_width(scenes);
  const plotWidth = plot_width(scenes, sceneWidth);

  const initLocationPos = locationPos(locations);
  let initScenePos = initialScenePos(sceneWidth, scenes, locations);
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
    initLocationPos,
    locations,
    sceneLocations,
    sceneCharacters,
    scene_data
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
    scenes,
    locations,
    sceneCharacters
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

  const initLegendPos = legendPos(characterScenes, plotWidth);
  const initLegendBoxPos = legend_box_pos(plotWidth, initLegendPos);

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
    initLegendBoxPos,
    character_quotes
  );

  const initSceneSummaryBox = base_scene_summary_box(initLegendBoxPos);

  let initSceneSummaryTexts = scene_summary_texts(
    initSceneSummaryBox,
    scenes,
    sceneSummaries
  );

  const updatedSceneSummaryPos = update_scene_summaries(
    plotWidth,
    initScenePos,
    initSceneSummaryBox,
    sceneCharacters,
    initCharacterPos,
    initSceneSummaryTexts,
    initCharacterQuoteBoxes
  );

  const initSceneSummaryBoxes = updatedSceneSummaryPos.scene_summary_boxes;
  initSceneSummaryTexts = updatedSceneSummaryPos.scene_summary_texts;

  const initColorBarPos = color_bar_pos(plotWidth, initScenePos);

  const plotHeight =
    initColorBarPos[0].y + initColorBarPos[0].height + 2 * character_height;

  const min_conflict_y = initScenePos[0].y - 0.75 * location_offset;
  const initConflictPoints = conflict_points(
    scene_data,
    min_conflict_y,
    initScenePos
  );

  const initConflictPath = conflictPath(initConflictPoints, initScenePos);

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
    sceneSummaryBoxes: initSceneSummaryBoxes,
    sceneSummaryTexts: initSceneSummaryTexts,
    colorBarPos: initColorBarPos,
    conflictPoints: initConflictPoints,
    conflictPath: initConflictPath,
  };
};
