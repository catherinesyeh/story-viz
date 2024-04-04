import Defs from "./Defs";
import YAxis from "./YAxis";
import XAxis from "./XAxis";
import ConflictCurve from "./ConflictCurve";
import MainPlot from "./MainPlot";
import OverlayInfo from "./Overlays/OverlayInfo";
import Legend from "./Legend";
import { positionStore } from "../stores/positionStore";
import { extra_yshift } from "../utils/consts";
import { storyStore } from "../stores/storyStore";

function StoryVis() {
  const { plotWidth, plotHeight, yShift, minConflictY, scenePos } =
    positionStore();
  const { overlay } = storyStore();
  return (
    <svg
      id="story"
      width="100%"
      viewBox={`0 0 ${plotWidth} ${
        plotHeight +
        yShift +
        (overlay !== "none" ? extra_yshift(minConflictY, scenePos) : 0)
      }`} // Maintain your calculated dimensions here for correct scaling
      preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio
    >
      <Defs />
      <ConflictCurve />
      <YAxis />
      <XAxis />
      <MainPlot />
      <OverlayInfo />
      <Legend />
    </svg>
  );
}

export default StoryVis;
