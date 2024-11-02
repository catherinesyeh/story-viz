import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import {
  character_height,
  character_offset,
  location_buffer,
  location_height,
  location_offset,
} from "../../utils/consts";
import OverlayCurve from "../Overlays/OverlayCurve";
import XAxis from "./XAxis";

function XAxisSVG() {
  const { plotWidth, plotHeight } = positionStore();
  const {
    overlay,
    story,
    yAxis,
    fullHeight,
    yAxisHeight,
    storyScrollX,
    setStoryScrollX,
    chapterView,
    storyMarginTop,
  } = storyStore();

  const ratio = yAxisHeight / plotHeight;
  const margin =
    story.includes("-new") &&
    !fullHeight &&
    !chapterView &&
    (yAxis === "location" || yAxis === "character")
      ? 160 * ratio
      : yAxis === "location" || yAxis === "character"
      ? 140
      : 20;

  useEffect(() => {
    if (document) {
      const elem = document.getElementById("x-axis-outer");
      if (elem) {
        elem.scrollTo({
          left: storyScrollX,
          //   behavior: "smooth",
        });
      }
    }
  }, [storyScrollX]);

  const handleScroll = (e: HTMLElement) => {
    const scroll = e.scrollLeft;
    setStoryScrollX(scroll);
  };
  return (
    <div
      id="x-axis-outer"
      style={{
        paddingLeft: `calc(${margin}px - 1rem)`,
        bottom:
          fullHeight ||
          (window &&
            plotHeight * ratio >
              window.innerHeight -
                storyMarginTop -
                (story.includes("-new") && !chapterView ? 150 : 250))
            ? location_offset * 2.5 -
              character_height +
              (story.includes("-new") && !chapterView ? 40 : 0)
            : undefined,
      }}
      onScroll={(e) => {
        handleScroll(e.currentTarget);
      }}
    >
      <svg
        id="story"
        width={!fullHeight ? "100%" : plotWidth * ratio}
        viewBox={`0 0 ${plotWidth} ${
          location_height * 2.5 -
          character_height +
          (overlay !== "none"
            ? location_buffer - character_offset
            : 0.75 * character_offset)
        }`} // Maintain your calculated dimensions here for correct scaling
        preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio>
      >
        <OverlayCurve />
        <XAxis />
      </svg>
    </div>
  );
}

export default XAxisSVG;
