import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import LocationAxis from "./LocationAxis";
import ColorAxis from "./ColorAxis";
import CharacterAxis from "./CharacterAxis";
import { location_height } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";

function YAxisDiv() {
  const { plotHeight } = positionStore();
  const { customYAxisOptions } = dataStore();
  const {
    yAxisHeight,
    storyMarginTop,
    storyScroll,
    setStoryScroll,
    fullHeight,
    story,
    yAxis,
    chapterView,
  } = storyStore();

  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;

  useEffect(() => {
    if (document) {
      const elem = document.getElementById("y-axis-div");
      if (elem) {
        elem.scrollTo({
          top: storyScroll,
          //   behavior: "smooth",
        });
      }
    }
  }, [storyScroll]);

  const handleScroll = (e: HTMLElement) => {
    const scroll = e.scrollTop;
    setStoryScroll(scroll);
  };

  return (
    <div
      id="y-axis-div"
      style={{
        height: "calc(100% - " + (storyMarginTop + 70) + "px",
        width:
          story.includes("-new") &&
          !fullHeight &&
          !chapterView &&
          (yAxis === "location" || yAxis === "character")
            ? 160 * ratio
            : yAxis === "location" || (yAxis === "character" && !fullHeight)
            ? 160
            : "auto",
      }}
      onScroll={(e) => {
        handleScroll(e.currentTarget);
      }}
    >
      <div
        id="y-axis-inner"
        style={{
          height: plotHeight * ratio,
          marginBottom:
            fullHeight ||
            (window &&
              plotHeight * ratio >
                window.innerHeight -
                  storyMarginTop -
                  (story.includes("-new") && !chapterView ? 150 : 250))
              ? location_height * 2.5 * ratio +
                5 +
                (story.includes("-new") && !chapterView ? 30 : 0)
              : undefined,
          fontSize:
            story.includes("-new") && !fullHeight && !chapterView
              ? 12 * ratio
              : yAxis === "character"
              ? Math.min(11, 14 * ratio)
              : 10,
        }}
      >
        {yAxis === "location" && <LocationAxis />}
        {(yAxis === "importance" ||
          yAxis === "sentiment" ||
          yAxis.includes("#") ||
          yAxis.includes("stacked") ||
          customYAxisOptions.includes(yAxis)) && <ColorAxis />}
        {yAxis === "character" && <CharacterAxis />}
      </div>
    </div>
  );
}

export default YAxisDiv;
