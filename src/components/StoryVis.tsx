import { useState } from "react";

import {
  data as scene_data,
  locations,
  location_quotes,
  location_chunks,
  scenes,
  sceneChunks,
  sceneSummaries,
  characterScenes,
  character_quotes,
  colors,
  sceneLocations,
  sceneCharacters,
  svgPath,
  bezierCommand,
} from "../data";

import * as d3 from "d3";

/* HELPERS */
// color scales
const emotionColor = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);
const conflictColor = d3.scaleSequential(d3.interpolateGreens);
const importanceColor = d3.scaleSequential(d3.interpolatePurples);

// normalize rating (originally between -1 and 1) to between 0 and 1
const normalizeRating = (rating: number) => (rating + 1) / 2;

// see if color is too dark --> if so, return white, else return black
const textColor = (val: number, diverging: boolean) => {
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
const color_dict = {
  importance: importance_increments,
  conflict: conflict_increments,
  emotion: emotion_increments,
};

// capitalize first letter of string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* CONSTS */
const location_height = 100;
const location_offset = location_height / 4;
const scene_width = 100;
const scene_offset = 2.75 * scene_width - location_offset;
const scene_margin = scene_width / 4;
const character_height = 10;
const character_offset = 1.5 * character_height;

const plot_width = scene_width * (scenes.length + 1.75) + scene_margin;
const plot_height =
  location_height * (locations.length + 2.4) + location_offset;

const line_length = scene_width * (scenes.length + 1);
const fade_in = scene_width / line_length / 2;

// convert to percent
const fade_in_percent = fade_in * 100;
const fade_out_percent = 100 - fade_in_percent;

/* ELEMENT POSITIONS */
// compute locations of locations labels
const locationPos = locations.map((_, i) => {
  return location_height * i + location_offset;
});

// compute locations of scene labels
const scenePos = scenes.map((_, i) => {
  return {
    x: scene_width * i + scene_offset,
    y: location_height * (locations.length + 0.25),
  };
});

// compute character positions
const characterPos = characterScenes.map((character) => {
  return character.scenes.map((scene) => {
    return {
      x: scenePos[scene].x - character_height,
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
const characterPaths = characterScenes.map((character, c) => {
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
if (max_y >= scenePos[0].y - 1.25 * location_offset) {
  scenePos.forEach((pos) => {
    pos.y = max_y + 1.25 * location_offset;
  });
}

// compute gray rect positions
const sceneBoxes = sceneCharacters.map((scene, i) => {
  return {
    x: scenePos[i].x - (scene_width / character_height) * 1.5,
    y:
      location_height * locations.indexOf(sceneLocations[i]) +
      character_height * (1 / (2 * scene.characters.length)),
    width: 2 * character_height,
    height: character_height * scene.characters.length * 2,
  };
});

// compute white rect positions behind text
const whiteBoxes = characterScenes.map((character, i) => {
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
const reverseCharacterNames = characterScenes.slice().reverse();
// let legend_offset = 0;
let legend_offset =
  3.5 *
  character_height *
  reverseCharacterNames[reverseCharacterNames.length - 1].character.length;
const legendPos = reverseCharacterNames.map((character, i) => {
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
const legend_box_pos = {
  x: plot_width - legend_offset + 1.5 * location_offset,
  y: 0,
  width: legend_offset - 2.25 * location_offset,
  height: character_height * 6,
};

// location quote box positions
const location_quote_boxes = locations.map((_, i) => {
  return {
    x: scene_offset - 1.25 * location_offset,
    y: locationPos[locationPos.length - 2] - location_offset,
    width: scene_width * 5,
    height: (location_quotes[i].quote.length + 3) * character_offset,
  };
});

// location quote text positions
const location_quote_texts = locations.map((_, i) => {
  return location_quotes[i].quote.map((_, j) => {
    return {
      x: scene_offset - 0.5 * location_offset,
      y: locationPos[locationPos.length - 2] + (j + 1.2) * character_offset,
    };
  });
});

// character quote box positions
const character_quote_boxes = characterScenes.map((_, i) => {
  return {
    x: legend_box_pos.x,
    y: location_height + location_offset - 2 * character_offset,
    width: scene_width * 5.5 + character_offset,
    height:
      (Math.max(character_quotes[i].quote.length, 2) + 3) * character_offset,
  };
});

// character quote text positions
const character_quote_texts = characterScenes.map((_, i) => {
  return character_quotes[i].quote.map((_, j) => {
    return {
      x: legend_box_pos.x + 0.75 * location_offset + 0.55 * location_height,
      y: character_quote_boxes[i].y + (j + 2.8) * character_offset,
    };
  });
});

// scene quote box positions
const scene_summary_boxes = {
  x: scene_width * 5 + scene_offset,
  y: 0,
  width: scene_width * 8,
};

const scene_summary_texts = scenes.map((_, i) => {
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

const color_bar_pos = Object.keys(color_dict).map((_, i) => {
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

function StoryVis() {
  // Initialize hidden array with useState
  const [hidden, setHidden] = useState<string[]>([]);
  const [locationHover, setLocationHover] = useState<string>("");
  const [characterHover, setCharacterHover] = useState<string>("");
  const [sceneHover, setSceneHover] = useState<string>("");

  const updateHidden = (name: string) => {
    setHidden((currentHidden) => {
      // Check if the name is already in the hidden array
      if (currentHidden.includes(name)) {
        // Return a new array without the name
        return currentHidden.filter((item) => item !== name);
      } else {
        // Return a new array with the name added
        return [...currentHidden, name];
      }
    });
  };

  return (
    <svg
      id="story"
      width="100%"
      viewBox={`0 0 ${plot_width} ${plot_height}`} // Maintain your calculated dimensions here for correct scaling
      preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio
    >
      <defs>
        {colors.map((color, i) => (
          <linearGradient
            id={"linear" + i}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            key={"linear" + i}
          >
            <stop offset="0%" stopColor="rgb(255,255,255,0)" />
            <stop offset={fade_in_percent + "%"} stopColor={color} />
            <stop offset={fade_out_percent + "%"} stopColor={color} />
            <stop offset="100%" stopColor="rgb(255,255,255,0)" />
          </linearGradient>
        ))}
        {Object.keys(color_dict).map((scale, _) => {
          const color_incs = (color_dict as Record<string, number[]>)[scale];
          const d3scale =
            scale === "emotion"
              ? emotionColor
              : scale === "conflict"
              ? conflictColor
              : importanceColor;
          const min_val = color_incs[0];
          const max_val = color_incs[color_incs.length - 1];
          const vals = color_incs.map(
            (val) => ((val - min_val) / (max_val - min_val)) * 100
          );
          return (
            <linearGradient
              id={"legend" + scale}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              key={"legend" + scale}
            >
              {color_incs.map((val, j) => (
                <stop offset={`${vals[j]}%`} stopColor={d3scale(val)} />
              ))}
            </linearGradient>
          );
        })}
        {/* adapted from: https://jsfiddle.net/jxtfeqag/ */}
        <marker
          id="head"
          orient="auto"
          markerWidth="6"
          markerHeight="6"
          refX="0.1"
          refY="3"
        >
          <path d="M0,0 V6 L4.5,3 Z" fill="#000000" />
        </marker>
      </defs>
      {/* add locations to y axis */}
      <g id="y-axis">
        {locations.map((location, i) => (
          <g
            key={"location-group " + i}
            className={
              "location-group " +
              ((locationHover === "" &&
                sceneHover === "" &&
                characterHover === "") ||
              locationHover === location ||
              sceneLocations[scenes.indexOf(sceneHover)] === location ||
              // check if character is in location
              characterScenes.find(
                (char) =>
                  char.locations.includes(location) &&
                  char.character === characterHover
              )
                ? ""
                : "faded")
            }
            onMouseEnter={() => setLocationHover(location)}
            onMouseLeave={() => setLocationHover("")}
          >
            {/* add img from assets for each location */}
            <image
              x={location_height}
              y={
                locationPos[i] +
                (location_chunks[i].length - 1) * character_offset
              }
              width={location_height * 0.75}
              height={location_height * 0.75}
              href={"/locations/location_" + (i + 1) + ".png"}
              key={"location image" + i}
            />
            <g className="location-name-group">
              {location_chunks[i].map((chunk, j) => (
                <text
                  className="location-name"
                  x={location_height * 1.75}
                  y={locationPos[i] + j * character_offset}
                  key={"location" + i + j}
                  textAnchor="end"
                >
                  {chunk}
                </text>
              ))}
            </g>
          </g>
        ))}
      </g>
      <g id="x-axis">
        {/* add scene names to x axis */}
        <g id="scenes">
          {scenes.map((scene, i) => (
            <g
              key={"scene-group" + i}
              className={
                "scene-name " +
                ((locationHover === "" &&
                  sceneHover === "" &&
                  characterHover === "") ||
                locationHover === sceneLocations[i] ||
                sceneHover === scene ||
                sceneCharacters[i].characters.includes(characterHover)
                  ? ""
                  : "faded")
              }
            >
              {sceneChunks[i].map((chunk, j) => (
                <text
                  x={scenePos[i].x + j * character_offset * 1.5}
                  y={scenePos[i].y}
                  textAnchor="end"
                  key={"scene" + i + j}
                  transform={
                    "rotate(-45," +
                    (scenePos[i].x + j * character_offset * 1.5) +
                    ", " +
                    scenePos[i].y +
                    ")"
                  }
                  onMouseEnter={() => setSceneHover(scene)}
                  onMouseLeave={() => setSceneHover("")}
                >
                  {chunk}
                </text>
              ))}
            </g>
          ))}
        </g>
        {/* add arrow showing time at bottom of plot */}
        <g id="time-arrow">
          <path
            id="arrow-line"
            markerEnd="url(#head)"
            strokeWidth="2"
            fill="none"
            stroke="black"
            d={`M${scenePos[0].x},${scenePos[0].y - 0.75 * location_offset}, ${
              scenePos[scenePos.length - 1].x
            },${scenePos[0].y - 0.75 * location_offset}`}
          />
          {/* add label to arrow */}
          <text
            x={scenePos[0].x}
            y={scenePos[0].y - 1.1 * location_offset}
            textAnchor="start"
            fill="black"
            className="time-label"
          >
            Time
          </text>
        </g>
      </g>
      {/* add rectangular bar across bottom of plot to serve as legend */}
      {Object.keys(color_dict).map((scale, i) => (
        <g
          className={"color-legend " + (sceneHover !== "" ? "highlight" : "")}
          key={"color legend bar" + scale}
          opacity={0}
        >
          <text
            x={color_bar_pos[i].x - 0.75 * character_offset}
            y={color_bar_pos[i].y + character_height}
            textAnchor="end"
            fill="black"
            className="legend-label"
            key={"legend-label left" + i}
          >
            {scale === "emotion" ? -1 : 0}
          </text>
          <rect
            id="legend-bar"
            x={color_bar_pos[i].x}
            y={color_bar_pos[i].y}
            width={color_bar_pos[i].width}
            height={color_bar_pos[i].height}
            fill={"url(#legend" + scale + ")"}
          />
          <text
            x={color_bar_pos[i].x + color_bar_pos[i].width / 2}
            y={color_bar_pos[i].y + 2.4 * character_height}
            textAnchor="middle"
          >
            {scale}
          </text>
          <text
            x={
              color_bar_pos[i].x +
              color_bar_pos[i].width +
              0.75 * character_offset
            }
            y={color_bar_pos[i].y + character_height}
            textAnchor="start"
            fill="black"
            className="legend-label"
            key={"legend-label right" + i}
          >
            1
          </text>
        </g>
      ))}

      {/* add characters to each scene */}
      {characterScenes.map((character, i) => (
        <g
          key={"chargroup" + i}
          className={
            "character-path " +
            character.character +
            " " +
            (hidden.includes(character.character) ? "hidden" : "") +
            " " +
            (characterHover !== "" && characterHover !== character.character
              ? "faded"
              : "")
          }
        >
          {/* add paths between scenes */}
          <g
            className={
              "path-group " +
              (locationHover !== "" ||
              sceneHover !== "" ||
              (characterHover !== "" && characterHover !== character.character)
                ? "faded"
                : "")
            }
          >
            {characterPaths[i].map((path, j) => (
              <path
                d={path}
                fill="none"
                stroke={"url(#linear" + i + ")"}
                //   stroke={colors[i]}
                key={"charpath" + j}
                strokeWidth={2}
                onMouseEnter={() => setCharacterHover(character.character)}
                onMouseLeave={() => setCharacterHover("")}
              />
            ))}
          </g>
          {/* add squares at each scene the character appears in */}
          <g className="character-squares">
            {character.scenes.map((scene, j) => (
              <rect
                x={characterPos[i][j].x}
                y={characterPos[i][j].y}
                width={character_height}
                height={character_height}
                fill={colors[i]}
                key={"charsq" + j}
                className={
                  "character-square " +
                  ((locationHover === "" && sceneHover === "") ||
                  locationHover === sceneLocations[scene] ||
                  scenes.indexOf(sceneHover) === scene
                    ? ""
                    : "faded")
                }
              />
            ))}
          </g>
          {/* add white rect behind character name */}
          <g
            className={
              "char-name-label " +
              ((sceneHover !== "" &&
                !character.scenes.includes(scenes.indexOf(sceneHover))) ||
              (locationHover !== "" &&
                !character.locations.includes(locationHover))
                ? "faded"
                : "")
            }
            onMouseEnter={() => setCharacterHover(character.character)}
            onMouseLeave={() => setCharacterHover("")}
          >
            <rect
              x={whiteBoxes[i].x}
              y={whiteBoxes[i].y}
              width={whiteBoxes[i].width}
              height={whiteBoxes[i].height}
              fill="white"
              opacity={0.8}
              key={"namebox" + i}
              className="name-box"
            />
            {/* add character name to the first scene they show up in */}
            <text
              x={characterPos[i][0].x - character_height / 2}
              y={characterPos[i][0].y + character_height}
              textAnchor="end"
              fill={colors[i]}
              className="character-name"
            >
              {character.character}
            </text>
          </g>
        </g>
      ))}
      {/* add gray rect behind each scene based on how many characters */}
      <g id="scene-boxes">
        {sceneCharacters.map((scene, i) => (
          <rect
            className={
              "scene-box " +
              (locationHover === sceneLocations[i] ||
              sceneHover === scene.scene ||
              scene.characters.includes(characterHover)
                ? "highlight"
                : "")
            }
            x={sceneBoxes[i].x}
            y={sceneBoxes[i].y}
            width={sceneBoxes[i].width}
            height={sceneBoxes[i].height}
            fillOpacity={0}
            strokeOpacity={0}
            stroke={"rgb(0,0,0,0.7)"}
            strokeWidth={2}
            key={"scenegroup" + i}
            onMouseEnter={() => setSceneHover(scene.scene)}
            onMouseLeave={() => setSceneHover("")}
          />
        ))}
      </g>
      {/* add box with quote from each location */}
      <g id="location-quotes">
        {locations.map((location, i) => (
          <g
            key={"location quotebox" + i}
            className={
              "quote-box " + (locationHover !== location ? "" : "highlight")
            }
            fillOpacity={0}
            strokeOpacity={0}
          >
            <rect
              x={location_quote_boxes[i].x}
              y={location_quote_boxes[i].y}
              width={location_quote_boxes[i].width}
              height={location_quote_boxes[i].height}
              fill="white"
              strokeWidth={2}
              stroke="#eee"
              opacity={0.8}
            />
            <text
              x={location_quote_texts[i][0].x}
              y={location_quote_texts[i][0].y - 1.2 * character_offset}
              textAnchor="start"
              className="quote-text bold"
            >
              {location}
            </text>
            {location_quotes[i].quote.map((quote, j) => (
              <text
                key={"location quote" + i + j}
                x={location_quote_texts[i][j].x}
                y={location_quote_texts[i][j].y}
                textAnchor="start"
                className="quote-text"
              >
                {quote}
              </text>
            ))}
          </g>
        ))}
      </g>
      {/* add legend */}
      <g id="legend">
        {/* draw legend box */}
        <rect
          x={legend_box_pos.x}
          y={legend_box_pos.y}
          width={legend_box_pos.width}
          height={legend_box_pos.height}
          //   fill="white"
          fillOpacity={0}
          stroke="#eee"
          strokeWidth={2}
          opacity={0.8}
        />
        {reverseCharacterNames.map((character, i) => (
          <g
            key={"legendbox" + i}
            transform={`translate(${legendPos[i].x}, ${legendPos[i].y})`}
            className={
              "legend-item " +
              (hidden.includes(character.character) ? "faded" : "")
            }
            onClick={() => updateHidden(character.character)}
            onMouseEnter={() => setCharacterHover(character.character)}
            onMouseLeave={() => setCharacterHover("")}
          >
            <rect
              x={0}
              y={0}
              width={character_height}
              height={character_height}
              fill={colors[reverseCharacterNames.length - 1 - i]}
            />
            <text
              x={character_offset}
              y={character_height}
              textAnchor="start"
              className="legend-name"
            >
              {character.character}
            </text>
          </g>
        ))}
      </g>
      {/* add box with quote from each character */}
      <g id="character-quotes">
        {characterScenes.map((character, i) => (
          <g
            key={"character quotebox" + i}
            className={
              "character quote-box " +
              (characterHover !== character.character ? "" : "highlight")
            }
            fillOpacity={0}
            strokeOpacity={0}
          >
            <g>
              <rect
                x={character_quote_boxes[i].x}
                y={character_quote_boxes[i].y}
                width={character_quote_boxes[i].width}
                height={character_quote_boxes[i].height}
                fill="white"
                strokeWidth={2}
                stroke={colors[i]}
                opacity={0.8}
              />
              <text
                x={character_quote_texts[i][0].x}
                y={
                  character_quote_texts[i][0].y -
                  1.2 * character_offset +
                  +(character_quote_texts[i].length < 2
                    ? 0.5 * character_offset
                    : 0)
                }
                textAnchor="start"
                className="quote-text bold"
                fill={colors[i]}
              >
                {character.character}
              </text>
              {character_quotes[i].quote.map((quote, j) => (
                <text
                  key={"character quote" + i + j}
                  x={character_quote_texts[i][j].x}
                  y={
                    character_quote_texts[i][j].y +
                    (character_quote_texts[i].length < 2
                      ? 0.5 * character_offset
                      : 0)
                  }
                  textAnchor="start"
                  className="quote-text"
                >
                  {quote}
                </text>
              ))}
            </g>
            <image
              className="character-image"
              x={character_quote_texts[i][0].x - 0.6 * location_height}
              y={
                character_quote_texts[i][0].y -
                2 * character_offset +
                (character_quote_texts[i].length <= 2
                  ? 0
                  : character_quote_boxes[i].height / 2 -
                    2.5 * character_offset)
              }
              width={location_height * 0.5}
              height={location_height * 0.5}
              key={"character image" + i}
              href={
                "/characters/" +
                character.character.split(" ")[0].toLowerCase() +
                ".png"
              }
            />
          </g>
        ))}
      </g>
      {/* add box with info about each scene */}
      <g id="scene-info">
        {scene_data.map((scene, i) => (
          <g
            key={"scene info" + i}
            className={
              "scene-info-box " + (sceneHover !== scene.name ? "" : "highlight")
            }
            fillOpacity={0}
            strokeOpacity={0}
          >
            <rect
              x={scene_summary_boxes.x}
              y={scene_summary_boxes.y}
              width={scene_summary_boxes.width}
              height={scene_summary_texts[i].height}
              fill="white"
              strokeWidth={2}
              stroke="#eee"
              opacity={0.8}
              className="scene-info-inner"
            />
            <g>
              {Object.keys(scene.ratings).map((rating, j) => {
                let rating_val = (scene.ratings as Record<string, number>)[
                  rating
                ];
                if (rating === "conflict") {
                  rating_val = normalizeRating(rating_val);
                }
                return (
                  <g key={"scene ratings for scene " + 0 + ": " + rating}>
                    <rect
                      x={
                        j % 3 === 0
                          ? scene_summary_texts[i].x
                          : j % 3 === 1
                          ? scene_summary_texts[i].x +
                            scene_summary_texts[i].third +
                            1.2 * character_offset
                          : scene_summary_texts[i].x +
                            2 * scene_summary_texts[i].third +
                            2.4 * character_offset
                      }
                      y={scene_summary_texts[i].y - character_offset}
                      width={scene_summary_texts[i].third}
                      height={character_offset * 1.8}
                      fill={
                        rating === "emotion"
                          ? emotionColor(rating_val)
                          : rating === "conflict"
                          ? conflictColor(rating_val)
                          : importanceColor(rating_val)
                      }
                    ></rect>
                    <text
                      key={"scene rating" + 0 + j}
                      x={
                        j % 3 === 0
                          ? scene_summary_texts[i].x +
                            0.5 * scene_summary_texts[i].third
                          : j % 3 === 1
                          ? scene_summary_texts[i].mid_x
                          : scene_summary_texts[i].end_x -
                            0.5 * scene_summary_texts[i].third
                      }
                      y={scene_summary_texts[i].y + 0.1 * character_offset}
                      textAnchor={"middle"}
                      className="scene-rating"
                      fill={
                        rating === "emotion"
                          ? textColor(rating_val, true)
                          : textColor(rating_val, false)
                      }
                    >
                      <tspan className="bold">{capitalize(rating)}:</tspan>{" "}
                      {rating_val.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </g>
            <text
              x={scene_summary_texts[i].x}
              y={scene_summary_texts[i].title_y}
              textAnchor="start"
              className="bold"
            >
              Scene {scene.number}: {scene.name}
            </text>
            {sceneSummaries[i].summary.map((summary, j) => (
              <text
                key={"scene summary" + i + j}
                x={scene_summary_texts[i].x}
                y={
                  scene_summary_texts[i].summary_y + 1.2 * j * character_offset
                }
                textAnchor="start"
                className="quote-text scene"
              >
                {summary}
              </text>
            ))}
            <text
              x={scene_summary_texts[i].x}
              y={scene_summary_texts[i].location_y}
              textAnchor="start"
              className="scene-location"
              key={"scene location" + i}
            >
              <tspan className="bold">Location:</tspan> {scene.location.name}
            </text>
            {/* add divider line */}
            <line
              x1={scene_summary_texts[i].x}
              y1={scene_summary_texts[i].divider_y}
              x2={scene_summary_texts[i].end_x}
              y2={scene_summary_texts[i].divider_y}
              stroke="#eee"
              strokeWidth={1}
              key={"scene divider" + i}
            />
            {/* add characters in scene */}
            <g>
              <text
                x={scene_summary_texts[i].x}
                y={scene_summary_texts[i].character_y}
                className="bold"
                key={"scene characters" + i}
              >
                Characters:
              </text>
              {sceneSummaries[i].emotions.map((char: any, j: number) => {
                const character = scene.characters.find(
                  (c) => c.name === char.character
                ) as any;
                const emotion = character.emotions[0].emotion;
                const rating = character.emotions[0].rating;
                return (
                  <g>
                    <text
                      key={"scene character" + i + j}
                      x={scene_summary_texts[i].x}
                      y={
                        scene_summary_texts[i].character_list_y +
                        1.4 * j * character_offset +
                        scene_summary_texts[i].character_offsets[j]
                      }
                      textAnchor="start"
                      className="scene-character bold"
                      fill={
                        colors[
                          characterScenes.findIndex(
                            (c) => c.character === char.character
                          )
                        ]
                      }
                    >
                      {char.character}
                    </text>
                    <g>
                      <rect
                        x={scene_summary_texts[i].end_x - 4 * character_height}
                        y={
                          scene_summary_texts[i].character_list_y -
                          0.9 * character_offset +
                          1.4 * j * character_offset +
                          scene_summary_texts[i].character_offsets[j]
                        }
                        width={character_height * 4}
                        height={character_height * 1.8}
                        fill={emotionColor(rating)}
                        key={"scene character rating sq" + i + j}
                      ></rect>
                      <text
                        x={scene_summary_texts[i].end_x - 2 * character_height}
                        y={
                          scene_summary_texts[i].character_list_y +
                          1.4 * j * character_offset +
                          scene_summary_texts[i].character_offsets[j]
                        }
                        textAnchor={"middle"}
                        className="scene-rating"
                        fill={textColor(rating, true)}
                        key={"scene character rating text" + i + j}
                      >
                        {rating.toFixed(2)}
                      </text>
                      <text
                        x={
                          scene_summary_texts[i].end_x -
                          4 * character_height -
                          character_offset
                        }
                        y={
                          scene_summary_texts[i].character_list_y +
                          1.4 * j * character_offset +
                          scene_summary_texts[i].character_offsets[j]
                        }
                        textAnchor={"end"}
                        className="scene-rating"
                        key={"scene character rating number" + i + j}
                      >
                        <tspan className="bold">{emotion}:</tspan>
                      </text>
                    </g>
                    <g>
                      {/* add quote from character */}
                      {char.emotion_quote.map((quote: any, l: number) => (
                        <text
                          key={"scene character quote" + i + j + l}
                          x={scene_summary_texts[i].x}
                          y={
                            scene_summary_texts[i].character_list_y +
                            1.4 * (j + 1) * character_offset +
                            1.2 * l * character_offset +
                            scene_summary_texts[i].character_offsets[j]
                          }
                          textAnchor="start"
                        >
                          {quote}
                        </text>
                      ))}
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default StoryVis;
