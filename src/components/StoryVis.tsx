import { useState } from "react";

import {
  data as scene_data,
  locations,
  location_quotes,
  scenes,
  sceneSummaries,
  characterScenes,
  character_quotes,
  sceneLocations,
  sceneCharacters,
  reverseCharacterNames,
} from "../utils/data";
import { capitalize, normalizeRating } from "../utils/helpers";
import {
  color_dict,
  colors,
  emotionColor,
  conflictColor,
  importanceColor,
  textColor,
} from "../utils/colors";
import {
  location_height,
  plot_height,
  plot_width,
  scene_width,
  character_height,
  character_offset,
  location_offset,
} from "../utils/consts";
import {
  characterPaths,
  characterPos,
  sceneBoxes,
  whiteBoxes,
  location_quote_boxes,
  location_quote_texts,
  character_quote_boxes,
  character_quote_texts,
  scene_summary_boxes,
  scene_summary_texts,
  scenePos,
  conflictPath,
  color_bar_pos,
  legendPos,
  legend_box_pos,
} from "../utils/positions";

import { storyStore } from "../store";
import Defs from "./Defs";
import YAxis from "./YAxis";
import XAxis from "./XAxis";

function StoryVis() {
  // Initialize hidden array with useState
  const [hidden, setHidden] = useState<string[]>([]);
  const {
    locationHover,
    characterHover,
    setCharacterHover,
    sceneHover,
    setSceneHover,
    showConflict,
    colorBy,
    showCharacterEmotions,
  } = storyStore();

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
      <Defs />
      <YAxis />
      <XAxis />

      {/* add conflict curve */}
      <g id="conflict-container">
        <path
          id="conflict-curve"
          d={conflictPath}
          fillOpacity={0}
          fill={"url(#rating" + colorBy + ")"}
          strokeWidth={2}
          className={
            (showConflict ? "highlight" : "") +
            (showConflict && (locationHover !== "" || characterHover !== "")
              ? " faded"
              : "")
          }
        />
        <g
          id="overlays"
          fillOpacity={!showConflict || sceneHover === "" ? 0 : 0.7}
        >
          <rect
            id="left-overlay"
            className="white-overlay"
            fill="url(#white-gradient)"
            x={scenePos[0].x}
            y={0}
            width={
              !showConflict || sceneHover === ""
                ? 0
                : scene_width * scenes.indexOf(sceneHover) - character_height
            }
            height={scenePos[0].y - 0.75 * location_offset}
          />
          <rect
            id="right-overlay"
            className="white-overlay"
            fill="url(#white-gradient-right)"
            x={
              !showConflict || sceneHover === ""
                ? scenePos[scenePos.length - 1].x
                : scenePos[scenes.indexOf(sceneHover)].x +
                  0.5 * character_offset
            }
            y={0}
            width={
              !showConflict || sceneHover === ""
                ? 0
                : (scenes.length - scenes.indexOf(sceneHover) - 1) * scene_width
            }
            height={scenePos[0].y - 0.75 * location_offset}
          />
        </g>
      </g>

      <g id="main-plot">
        {/* white boxes behind each scene */}
        <g id="scene-box-fills">
          {sceneCharacters.map((scene, i) => (
            <rect
              className={
                "scene-box-fill " +
                (showConflict &&
                (locationHover === sceneLocations[i] ||
                  sceneHover === scene.scene ||
                  scene.characters.includes(characterHover))
                  ? "highlight"
                  : "")
              }
              x={sceneBoxes[i].x}
              y={sceneBoxes[i].y}
              width={sceneBoxes[i].width}
              height={sceneBoxes[i].height}
              fillOpacity={0}
              fill="white"
              key={"scenegroup fill" + i}
            />
          ))}
        </g>
        {/* add characters to each scene */}
        <g id="character-paths">
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
                  (characterHover !== "" &&
                    characterHover !== character.character)
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
                {character.scenes.map((scene, j) => {
                  const emotion_val = scene_data[scene].characters.find(
                    (c) => c.name === character.character
                  )?.emotions[0].rating as number;
                  const color = emotionColor(emotion_val);

                  return (
                    <rect
                      x={characterPos[i][j].x}
                      y={characterPos[i][j].y}
                      width={character_height}
                      height={character_height}
                      fill={showCharacterEmotions ? color : colors[i]}
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
                  );
                })}
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
                  className={"name-box " + (showConflict ? "faded" : "")}
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
        </g>
        {/* add box outline for characters in each scene */}
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
      </g>

      <g id="overlay-info">
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
                "scene-info-box " +
                (sceneHover !== scene.name ? "" : "highlight")
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
                    scene_summary_texts[i].summary_y +
                    1.2 * j * character_offset
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
                    <g key={"scene character" + i + j}>
                      <text
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
                          x={
                            scene_summary_texts[i].end_x - 4 * character_height
                          }
                          y={
                            scene_summary_texts[i].character_list_y -
                            0.9 * character_offset +
                            1.4 * j * character_offset +
                            scene_summary_texts[i].character_offsets[j]
                          }
                          width={character_height * 4}
                          height={character_height * 1.8}
                          fill={emotionColor(rating)}
                        ></rect>
                        <text
                          x={
                            scene_summary_texts[i].end_x - 2 * character_height
                          }
                          y={
                            scene_summary_texts[i].character_list_y +
                            1.4 * j * character_offset +
                            scene_summary_texts[i].character_offsets[j]
                          }
                          textAnchor={"middle"}
                          className="scene-rating"
                          fill={textColor(rating, true)}
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
      </g>

      {/* add legend */}
      <g id="legends">
        <g id="legend">
          {/* draw legend box */}
          <rect
            x={legend_box_pos.x}
            y={legend_box_pos.y}
            width={legend_box_pos.width}
            height={legend_box_pos.height}
            fill="white"
            // fillOpacity={0}
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
        {/* add rectangular bar across bottom of plot to serve as legend */}
        <g id="color-legends">
          {Object.keys(color_dict).map((scale, i) => (
            <g
              className={
                "color-legend " +
                (sceneHover !== "" || showConflict || showCharacterEmotions
                  ? "highlight"
                  : "")
              }
              key={"color legend bar" + scale}
              opacity={0}
            >
              <text
                x={color_bar_pos[i].x - 0.75 * character_offset}
                y={color_bar_pos[i].y + character_height}
                textAnchor="end"
                fill="black"
                className="legend-label"
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
              >
                1
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

export default StoryVis;
