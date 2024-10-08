import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import {
  location_height,
  character_offset,
  location_buffer,
  location_offset,
  character_height,
} from "../utils/consts";
import { positionStore } from "../stores/positionStore";

import Image from "./Image";
import { onlyLetters } from "../utils/helpers";

function YAxis() {
  const {
    story,
    locationHover,
    setLocationHover,
    sceneHover,
    characterHover,
    setCharacterHover,
    yAxis,
  } = storyStore();
  const {
    sceneLocations,
    scenes,
    characterScenes,
    locations,
    location_chunks,
    location_data,
    sortedCharacters,
  } = dataStore();
  const { locationPos, yShift, characterPos } = positionStore();

  const maxCharLength = 20;

  const num_characters = characterScenes.length;
  const maxLoc =
    locations.length <= 8
      ? locationPos[locations.length - 1]
      : Math.max(
          700,
          num_characters * (0.5 * character_offset + character_height)
        );

  return (
    <g id="y-axis" transform={"translate(0 " + yShift + ")"}>
      {/* add locations to y axis */}
      {yAxis === "location" &&
        locations.map((location, i) => (
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
            {location_chunks[i] && (
              <>
                <Image
                  x={location_height}
                  y={
                    locationPos[i] +
                      (location_chunks[i].length - 1) * character_offset || 0
                  }
                  width={location_height * 0.75}
                  height={location_height * 0.75}
                  href={
                    "locations/" +
                    onlyLetters(story.replace("mov", "")) +
                    "/" +
                    location_data.find((l) => l.name === location)?.key +
                    ".png"
                  }
                  placeholder="locations/placeholder.png"
                  className="location-img"
                />
                <g className="location-name-group">
                  {location_chunks[i].map((chunk, j) => (
                    <text
                      className="location-name"
                      x={location_height * 1.7}
                      y={locationPos[i] + j * character_offset || 0}
                      key={"location" + i + j}
                      textAnchor="end"
                    >
                      {chunk}
                    </text>
                  ))}
                </g>
              </>
            )}
          </g>
        ))}
      {/* vertical bar with sentiment gradient */}
      {(yAxis === "sentiment" || yAxis === "importance") && (
        <g>
          <rect
            id="y-gradient"
            x={location_buffer}
            y={0.5 * location_offset}
            width={location_offset}
            height={maxLoc + location_offset}
            fill={`url(#vert-legend${yAxis})`}
          ></rect>
          <text
            x={location_buffer + 0.5 * location_offset}
            y={1.5 * location_offset}
            className="y-axis-label"
            textAnchor="middle"
            fill="white"
          >
            1
          </text>
          <text
            x={location_buffer + 0.5 * location_offset}
            y={maxLoc + location_offset}
            className="y-axis-label"
            textAnchor="middle"
            fill={yAxis === "sentiment" ? "white" : "black"}
          >
            {yAxis === "sentiment" ? -1 : 0}
          </text>
          {/* Add the rotated label */}
          <text
            transform={`rotate(-90)`}
            x={-maxLoc / 2 - location_offset}
            y={location_buffer - location_offset} // Adjust to position left of the legend bar
            textAnchor="middle"
          >
            {yAxis === "sentiment" ? "sentiment" : "importance"}
          </text>
        </g>
      )}
      {yAxis === "character" && (
        <g>
          {characterScenes.map((char, i) => {
            const sortChar = sortedCharacters.find(
              (c) => c.character === char.character
            );
            return (
              <text
                key={"character" + i}
                x={location_height * 1.7}
                y={
                  characterPos[i] &&
                  characterPos[i][0] &&
                  characterPos[i][0].y + 0.5 * character_offset
                }
                textAnchor="end"
                onMouseEnter={() => setCharacterHover(char.character)}
                onMouseLeave={() => setCharacterHover("")}
              >
                {sortChar && sortChar.short
                  ? sortChar.short
                  : char.character.length > maxCharLength
                  ? char.character.slice(0, maxCharLength) + "..."
                  : char.character}
              </text>
            );
          })}
        </g>
      )}
    </g>
  );
}

export default YAxis;
