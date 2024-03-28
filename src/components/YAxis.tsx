import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import {
  location_height,
  character_offset,
  location_offset,
} from "../utils/consts";
import { positionStore } from "../stores/positionStore";

function YAxis() {
  const {
    story,
    locationHover,
    setLocationHover,
    sceneHover,
    characterHover,
    showConflict,
  } = storyStore();
  const {
    sceneLocations,
    scenes,
    characterScenes,
    locations,
    location_chunks,
    sceneCharacters,
  } = dataStore();
  const { locationPos, scenePos, characterPos } = positionStore();
  const charactersInFirstScene = sceneCharacters[0].characters;
  const lastCharacter =
    charactersInFirstScene[charactersInFirstScene.length - 1];
  const lastCharacterIndex = characterScenes.findIndex(
    (char) => char.character === lastCharacter
  );
  const lastCharacterYPos = characterPos[lastCharacterIndex][0].y;
  return (
    <g id="y-axis">
      {/* add locations to y axis */}
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
                (location_chunks[i].length - 1) * character_offset || 0
            }
            width={location_height * 0.75}
            height={location_height * 0.75}
            href={"/locations/" + story + "/location_" + (i + 1) + ".png"}
          />
          <g className="location-name-group">
            {location_chunks[i].map((chunk, j) => (
              <text
                className="location-name"
                x={location_height * 1.75}
                y={locationPos[i] + j * character_offset || 0}
                key={"location" + i + j}
                textAnchor="end"
              >
                {chunk}
              </text>
            ))}
          </g>
        </g>
      ))}

      {/* add vertical arrow as y axis */}
      <g
        id="y-arrow"
        fillOpacity={0}
        strokeOpacity={0}
        className={showConflict ? "highlight" : ""}
      >
        <path
          id="arrow-line-y"
          // markerEnd={!showConflict ? "" : "url(#head)"}
          strokeWidth="2"
          stroke="black"
          d={`M${scenePos[0].x},${scenePos[0].y - 0.75 * location_offset}, ${
            scenePos[0].x
          },${lastCharacterYPos + 1.5 * character_offset}`}
        />
        {/* add label to arrow */}
        <text
          x={scenePos[0].x - 0.5 * location_offset}
          y={lastCharacterYPos + 1.5 * character_offset || 0}
          textAnchor="end"
          className="conflict-label"
          transform={
            "rotate(-90," +
            (scenePos[0].x - 0.5 * location_offset) +
            ", " +
            (lastCharacterYPos + 1.5 * character_offset) +
            ")"
          }
        >
          Conflict (max: 1)
        </text>
      </g>
    </g>
  );
}

export default YAxis;
