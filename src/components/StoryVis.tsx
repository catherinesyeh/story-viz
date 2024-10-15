import Defs from "./Defs";
import MainPlot from "./MainPlot";
import OverlayInfo from "./Overlays/OverlayInfo";
import { positionStore } from "../stores/positionStore";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { useEffect, useRef } from "react";
import XAxisSVG from "./XAxis/XAxisSvg";

function StoryVis() {
  const { plotWidth, plotHeight, scenePos } = positionStore();
  const { locations, scene_data } = dataStore();
  const {
    fullHeight,
    yAxis,
    setYAxisHeight,
    setXAxisWidth,
    setStoryScroll,
    storyScroll,
    setStoryScrollX,
  } = storyStore();

  const storyRef = useRef<SVGSVGElement>(null);

  const handleResize = () => {
    if (storyRef.current) {
      const storyHeight = storyRef.current.getBoundingClientRect().height;
      const storyWidth = storyRef.current.getBoundingClientRect().width;
      setYAxisHeight(storyHeight);
      setXAxisWidth(storyWidth);
      setStoryScroll(0);
      setStoryScrollX(0);
    }
  };

  const handleScroll = () => {
    if (window) {
      const scrollY = window.scrollY;
      setStoryScroll(scrollY);
    }
  };

  useEffect(() => {
    if (window) {
      window.scrollTo(0, storyScroll);
    }
  }, [storyScroll]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (scene_data && scenePos) {
      handleResize();
    }
  }, [scene_data, scenePos, fullHeight]);

  return (
    <div>
      <svg
        id="story"
        ref={storyRef}
        height={
          fullHeight
            ? yAxis === "location" && locations.length > 8
              ? `${Math.min(
                  plotHeight - 400,
                  800 + (locations.length - 8) * 50
                )}px`
              : 600
            : undefined
        }
        width={!fullHeight ? "100%" : undefined}
        viewBox={`0 0 ${plotWidth} ${plotHeight}`} // Maintain your calculated dimensions here for correct scaling
        preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio
      >
        <Defs />
        <MainPlot />
        <OverlayInfo />
      </svg>
      <XAxisSVG />
    </div>
  );
}

export default StoryVis;
