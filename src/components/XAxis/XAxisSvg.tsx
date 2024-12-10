import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import {
  character_height,
  character_offset,
  location_buffer,
  location_height,
  location_offset,
  scene_overlay_width,
} from "../../utils/consts";
import OverlayCurve from "../Vis/OverlayCurve";
import XAxis from "./XAxis";

function XAxisSVG() {
  const { plotWidth, plotHeight } = positionStore();
  const {
    showOverlay,
    story,
    yAxis,
    fullHeight,
    yAxisHeight,
    storyScrollX,
    setStoryScrollX,
    chapterView,
    storyMarginTop,
    detailView,
  } = storyStore();

  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;
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

  useEffect(() => {
    if (document) {
      const elem = document.getElementById("x-axis-outer");
      if (elem) {
        // Set the CSS variable for the dynamic width
        elem.style.setProperty(
          "--extra-left-width",
          `calc(${margin}px + 1rem)`
        );
        elem.classList.add("extra-left");
      }
    }
  }, [margin]);

  const handleScroll = (e: HTMLElement) => {
    const scroll = e.scrollLeft;
    setStoryScrollX(scroll);
  };
  return (
    <div
      id="x-axis-outer"
      className={detailView ? "extra-left" : ""}
      style={{
        paddingLeft: `calc(${margin}px - 1rem)`,
        width: `calc(100% - 3rem - ${detailView ? scene_overlay_width : 0}px)`,
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
        width={
          detailView
            ? plotWidth < scene_overlay_width
              ? plotWidth
              : `calc(100% + ${scene_overlay_width}px)`
            : !fullHeight
            ? "100%"
            : plotWidth * ratio
        }
        viewBox={`0 0 ${plotWidth} ${
          location_height * 2.5 -
          character_height +
          (showOverlay
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
