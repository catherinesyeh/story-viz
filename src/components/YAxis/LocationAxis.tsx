import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import { location_height } from "../../utils/consts";

function LocationAxis() {
  const { locations, sceneLocations, scenes, characterScenes } = dataStore();
  const { plotHeight } = positionStore();
  const {
    yAxisHeight,
    locationHover,
    sceneHover,
    characterHover,
    setLocationHover,
  } = storyStore();
  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;
  const locHeight = location_height * ratio;
  return (
    <>
      {locations.map((location) => {
        return (
          <div
            key={location}
            style={{ height: locHeight }}
            className={
              "location-box " +
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
            <p>{location}</p>
          </div>
        );
      })}
    </>
  );
}

export default LocationAxis;
