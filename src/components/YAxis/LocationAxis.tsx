import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import { location_height } from "../../utils/consts";
import InfoTooltip from "../Misc/InfoTooltip";

function LocationAxis() {
  const { locations, sceneLocations, scenes, characterScenes } = dataStore();
  const { plotHeight } = positionStore();
  const {
    yAxisHeight,
    locationHover,
    sceneHover,
    characterHover,
    setLocationHover,
    fullHeight,
    chapterView,
    story,
    linkHover,
  } = storyStore();
  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;
  const locHeight = location_height * ratio;
  return (
    <>
      <b style={{ textAlign: "right", display: "block" }}>
        Locations
        {(!story.includes("-new") || fullHeight || chapterView) && (
          <InfoTooltip label="hover on a location for more info; listed in order of appearance" />
        )}
      </b>
      {locations.map((location) => {
        return (
          <div
            key={location}
            style={{ height: locHeight }}
            className={
              "location-box " +
              ((locationHover === "" &&
                sceneHover === "" &&
                characterHover === "" &&
                linkHover.length === 0) ||
              locationHover === location ||
              sceneLocations[scenes.indexOf(sceneHover)] === location ||
              // check if character is in location
              characterScenes.find(
                (char) =>
                  char.locations.includes(location) &&
                  (char.character === characterHover ||
                    linkHover.includes(char.character))
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
