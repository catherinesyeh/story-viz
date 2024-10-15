import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import LocationAxis from "./LocationAxis";
import ColorAxis from "./ColorAxis";
import CharacterAxis from "./CharacterAxis";
import {
  character_offset,
  location_buffer,
  location_height,
} from "../../utils/consts";

function YAxisDiv() {
  const { plotHeight } = positionStore();
  const {
    yAxisHeight,
    storyMarginTop,
    storyScroll,
    setStoryScroll,
    fullHeight,
    story,
    overlay,
    yAxis,
  } = storyStore();

  const ratio = yAxisHeight / plotHeight;

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
          (yAxis === "location" || yAxis === "character")
            ? 160 * ratio
            : yAxis === "location" || yAxis === "character"
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
          height:
            plotHeight * ratio +
            (overlay !== "none"
              ? (location_buffer - character_offset) * ratio
              : 0),
          marginBottom: fullHeight
            ? location_height * 2.5 * ratio + 5
            : undefined,
          fontSize:
            story.includes("-new") && !fullHeight
              ? 12 * ratio
              : yAxis === "character"
              ? Math.min(14, 14 * ratio)
              : 10,
        }}
      >
        {yAxis === "location" && <LocationAxis />}
        {(yAxis === "importance" ||
          yAxis === "sentiment" ||
          yAxis.includes("stacked")) && <ColorAxis />}
        {yAxis === "character" && <CharacterAxis />}
      </div>
    </div>
  );
}

export default YAxisDiv;
