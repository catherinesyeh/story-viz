import {
  data as scene_data,
  scenes,
  locations,
  characterScenes,
  sceneLocations,
  sceneCharacters,
  location_quotes,
  sceneSummaries,
  character_quotes,
  reverseCharacterNames,
} from "./data";
import { color_dict } from "./colors";
import { bezierCommand, svgPath } from "./curve";
import { normalizeRating } from "./helpers";

import {
  location_height,
  location_offset,
  scene_width,
  scene_offset,
  character_height,
  character_offset,
  plot_width,
  plot_height,
} from "./consts";

/* ELEMENT POSITIONS */
// compute locations of locations labels
export const locationPos = locations.map((_, i) => {
  return location_height * i + location_offset;
});

// compute locations of scene labels
const initialScenePos = scenes.map((_, i) => {
  return {
    x: scene_width * i + scene_offset,
    y: location_height * (locations.length + 0.25),
  };
});

// compute character positions
export const characterPos = characterScenes.map((character) => {
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

// compute character paths
let max_y = 0;
export const characterPaths = characterScenes.map((character, c) => {
  const paths = [];

  const character_coords = characterPos[characterScenes.indexOf(character)];
  // convert to array of arrays, adjust for character height
  const character_coords_arr = character_coords.map((pos: any) => [
    pos.x + character_height / 2,
    pos.y + character_height / 2,
  ]);

  // add point to the character's path at the start of the story
  character_coords_arr.unshift([
    character_coords_arr[0][0] - scene_width / 2,
    character_coords_arr[0][1],
  ]);

  // add point to the character's path at the end of the story
  character_coords_arr.push([
    character_coords_arr[character_coords_arr.length - 1][0] + scene_width / 2,
    character_coords_arr[character_coords_arr.length - 1][1],
  ]);

  // add intermediate points if there is a gap of 3+ scenes
  for (let i = 1; i < character_coords_arr.length; i++) {
    const cur_x = character_coords_arr[i][0];
    const prev_x = character_coords_arr[i - 1][0];
    const cur_y = character_coords_arr[i][1];
    const prev_y = character_coords_arr[i - 1][1];

    if (cur_x - prev_x > scene_width) {
      if (cur_x - prev_x > scene_width * 2) {
        const max_cur_y =
          cur_y +
          Math.ceil(
            (location_height * (locations.length - 1) - cur_y) / location_height
          ) *
            location_height;
        const max_prev_y =
          prev_y +
          Math.ceil(
            (location_height * (locations.length - 1) - prev_y) /
              location_height
          ) *
            location_height;

        const new_y = Math.max(max_cur_y, max_prev_y) + c * character_offset;

        // big gap so add two points
        character_coords_arr.splice(i, 0, [prev_x + scene_width, new_y]);
        character_coords_arr.splice(i + 1, 0, [cur_x - scene_width, new_y]);
        i += 3;
      } else {
        if (cur_y > prev_y) {
          // if character is moving down
          character_coords_arr.splice(i, 0, [cur_x - scene_width, prev_y]);
          i += 2;
        } else if (cur_y < prev_y) {
          // if character is moving up
          character_coords_arr.splice(i, 0, [prev_x + scene_width, cur_y]);
          i += 2;
        } else {
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

          const new_y = Math.max(max_cur_y, max_prev_y) + c * character_offset;

          // big gap so add two points
          character_coords_arr.splice(i, 0, [prev_x + scene_width / 2, new_y]);
          character_coords_arr.splice(i + 1, 0, [
            cur_x - scene_width / 2,
            new_y,
          ]);
          i += 3;
        }
      }
    }
  }
  // update max_y based on character_coords_arr
  max_y = Math.max(
    max_y,
    ...character_coords_arr.map((pos) => {
      return pos[1];
    })
  );
  paths.push(svgPath(character_coords_arr, bezierCommand));
  return paths;
});

// update scenePos y coords if max_y is greater than the current max
if (max_y >= initialScenePos[0].y - 1.25 * location_offset) {
  initialScenePos.forEach((pos) => {
    pos.y = max_y + 1.25 * location_offset;
  });
}

export const scenePos = initialScenePos;

// compute scene box positions
export const sceneBoxes = sceneCharacters.map((scene, i) => {
  return {
    x: scenePos[i].x - scene_width / character_height,
    y:
      location_height * locations.indexOf(sceneLocations[i]) +
      character_height * (1 / (2 * scene.characters.length)),
    width: 2 * character_height,
    height: character_height * scene.characters.length * 2,
  };
});

// compute white rect positions behind text
export const whiteBoxes = characterScenes.map((character, i) => {
  return {
    x:
      characterPos[i][0].x -
      character.character.length * character_height * 0.68,
    y: characterPos[i][0].y,
    width: character.character.length * 0.65 * character_height,
    height: character_height * 1.25,
  };
});

// compute pos of legend items
// put in 2 rows
let legend_offset =
  3.5 *
  character_height *
  reverseCharacterNames[reverseCharacterNames.length - 1].character.length;
export const legendPos = reverseCharacterNames.map((character, i) => {
  let y_offset = location_offset * 0.6;

  const my_offset = legend_offset;
  if (i % 2 === 1) {
    y_offset += character_height * 2;
  } else {
    legend_offset +=
      character_height * character.character.length + character_offset;
  }

  return {
    x: plot_width - my_offset,
    y: y_offset,
  };
});

// legend box pos
export const legend_box_pos = {
  x: plot_width - legend_offset + 1.5 * location_offset,
  y: 0,
  width: legend_offset - 2.25 * location_offset,
  height: character_height * 6,
};

// location quote box positions
export const location_quote_boxes = locations.map((_, i) => {
  return {
    x: scene_offset - 1.25 * location_offset,
    y: locationPos[locationPos.length - 2] - location_offset,
    width: scene_width * 5,
    height: (location_quotes[i].quote.length + 3) * character_offset,
  };
});

// location quote text positions
export const location_quote_texts = locations.map((_, i) => {
  return location_quotes[i].quote.map((_, j) => {
    return {
      x: scene_offset - 0.5 * location_offset,
      y: locationPos[locationPos.length - 2] + (j + 1.2) * character_offset,
    };
  });
});

// character quote box positions
export const character_quote_boxes = characterScenes.map((_, i) => {
  return {
    x: legend_box_pos.x,
    y: location_height + location_offset - 2 * character_offset,
    width: scene_width * 5.5 + character_offset,
    height:
      (Math.max(character_quotes[i].quote.length, 2) + 3) * character_offset,
  };
});

// character quote text positions
export const character_quote_texts = characterScenes.map((_, i) => {
  return character_quotes[i].quote.map((_, j) => {
    return {
      x: legend_box_pos.x + 0.75 * location_offset + 0.55 * location_height,
      y: character_quote_boxes[i].y + (j + 2.8) * character_offset,
    };
  });
});

// scene quote box positions
export const scene_summary_boxes = {
  x: scene_width * 5 + scene_offset,
  y: 0,
  width: scene_width * 8,
};

export const scene_summary_texts = scenes.map((_, i) => {
  const start_x = scene_width * 5 + scene_offset + 0.75 * location_offset;
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

  // count how many elements are in the summary list
  const summary_length = sceneSummaries[i].summary.length;
  let num_multiline = summary_length > 1 ? 1 : 0;
  const num_characters = sceneSummaries[i].emotions.length;
  // sum the number of elements in each emotion quote list
  const emotion_lines = sceneSummaries[i].emotions.reduce(
    (acc: number, cur: any) => {
      if (cur.emotion_quote.length > 1) {
        num_multiline += 1;
      }
      return acc + cur.emotion_quote.length;
    },
    0
  );

  const ratio = (num_multiline - 1) / (num_characters + 1);
  const height =
    (summary_length + emotion_lines + 1) * 1.2 * character_offset +
    (num_characters + 6 + ratio * 0.5) * 1.6 * character_offset;

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

// color bar positions
export const color_bar_pos = Object.keys(color_dict).map((_, i) => {
  const width = (plot_width - 2 * location_offset) / 2 + 2;
  const gap = 2;
  const third = width / 3 - gap * 2 * character_offset;
  const y = plot_height - 1.8 * character_offset;
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
const min_conflict_y = scenePos[0].y - 0.75 * location_offset;
const conflict_points = scene_data.map((scene, i) => {
  // for each scene, compute the x and y coordinates for the curve
  const x = scenePos[i].x;
  // y should be between min_conflict_y and 0 (max conflict)
  const conflict = normalizeRating(scene.ratings.conflict);
  const y = min_conflict_y - conflict * min_conflict_y;
  return { x: x, y: y };
});

// compute conflict curve
export const conflictPath = (() => {
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
})();
