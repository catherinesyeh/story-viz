import Defs from "./Defs";
import YAxis from "./YAxis";
import XAxis from "./XAxis";
import OverlayCurve from "./OverlayCurve";
import MainPlot from "./MainPlot";
import OverlayInfo from "./Overlays/OverlayInfo";
import { positionStore } from "../stores/positionStore";
import { extra_yshift } from "../utils/consts";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import Legend from "./Legend";

function StoryVis() {
  const { plotWidth, plotHeight, minConflictY, scenePos } = positionStore();
  const { locations } = dataStore();
  const { overlay, fullHeight, yAxis } = storyStore();
  return (
    <svg
      id="story"
      height={
        fullHeight
          ? yAxis === "location" && locations.length > 8
            ? `${Math.min(
                plotHeight - 600,
                800 + (locations.length - 8) * 50
              )}px`
            : 800
          : undefined
      }
      width={!fullHeight ? "100%" : undefined}
      viewBox={`0 0 ${plotWidth} ${
        plotHeight +
        (overlay !== "none" ? extra_yshift(minConflictY, scenePos) : 0)
      }`} // Maintain your calculated dimensions here for correct scaling
      preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio
    >
      <Defs />
      <OverlayCurve />
      <YAxis />
      <XAxis />
      <MainPlot />
      <Legend />
      <OverlayInfo />
    </svg>
  );
}

export default StoryVis;
