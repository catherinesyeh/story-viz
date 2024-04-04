import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { location_height, character_offset } from "../utils/consts";
import { positionStore } from "../stores/positionStore";

import Image from "./Image";
import { onlyLetters } from "../utils/helpers";

function YAxis() {
  const { story, locationHover, setLocationHover, sceneHover, characterHover } =
    storyStore();
  const {
    sceneLocations,
    scenes,
    characterScenes,
    locations,
    location_chunks,
    location_data,
  } = dataStore();
  const { locationPos, yShift } = positionStore();
  return (
    <g id="y-axis" transform={"translate(0 " + yShift + ")"}>
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
          {location_chunks[i] && (
            <>
              <Image
                x={location_height * 0.9}
                y={
                  locationPos[i] +
                    (location_chunks[i].length - 1) * character_offset || 0
                }
                width={location_height * 0.75}
                height={location_height * 0.75}
                href={
                  "/locations/" +
                  onlyLetters(story) +
                  "/" +
                  location_data.find((l) => l.name === location)?.key +
                  ".png"
                }
                placeholder="/locations/placeholder.png"
                className="location-img"
              />
              <g className="location-name-group">
                {location_chunks[i].map((chunk, j) => (
                  <text
                    className="location-name"
                    x={location_height * 1.6}
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
    </g>
  );
}

export default YAxis;
