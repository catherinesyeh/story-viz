import { storyStore } from "../stores/store";
import { dataStore } from "../stores/dataStore";
import {
  location_height,
  character_offset,
  location_offset,
} from "../utils/consts";
import { locationPos, scenePos } from "../utils/positions";

function YAxis() {
  const {
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
  } = dataStore();
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
              (location_chunks[i].length - 1) * character_offset
            }
            width={location_height * 0.75}
            height={location_height * 0.75}
            href={"/locations/location_" + (i + 1) + ".png"}
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
          },${locationPos[0] + 2}`}
        />
        {/* add label to arrow */}
        <text
          x={scenePos[0].x - 0.5 * location_offset}
          y={locationPos[0] + character_offset}
          textAnchor="end"
          className="conflict-label"
          transform={
            "rotate(-90," +
            (scenePos[0].x - 0.5 * location_offset) +
            ", " +
            (locationPos[0] + character_offset) +
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
