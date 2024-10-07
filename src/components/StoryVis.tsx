import Defs from "./Defs";
import YAxis from "./YAxis";
import XAxis from "./XAxis";
import OverlayCurve from "./OverlayCurve";
import MainPlot from "./MainPlot";
import OverlayInfo from "./Overlays/OverlayInfo";
import Legend from "./Legend";
import { positionStore } from "../stores/positionStore";
import { extra_yshift } from "../utils/consts";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";

function StoryVis() {
  const { plotWidth, plotHeight, yShift, minConflictY, scenePos } =
    positionStore();
  const { locations } = dataStore();
  const { overlay, fullHeight } = storyStore();
  return (
    <svg
      id="story"
      height={
        fullHeight
          ? locations.length <= 8
            ? `${800 + (locations.length - 8) * 50}px`
            : `${Math.min(
                plotHeight - 600,
                800 + (locations.length - 8) * 50
              )}px`
          : undefined
      }
      width={!fullHeight ? "100%" : undefined}
      viewBox={`0 0 ${plotWidth} ${
        plotHeight +
        yShift +
        (overlay !== "none" ? extra_yshift(minConflictY, scenePos) : 0)
      }`} // Maintain your calculated dimensions here for correct scaling
      preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio
    >
      <Defs />
      <OverlayCurve />
      <YAxis />
      <XAxis />
      <MainPlot />
      <OverlayInfo />
      <Legend />
    </svg>
  );
}

export default StoryVis;
