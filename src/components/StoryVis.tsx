import Defs from "./Defs";
import YAxis from "./YAxis";
import XAxis from "./XAxis";
import ConflictCurve from "./ConflictCurve";
import MainPlot from "./MainPlot";
import OverlayInfo from "./Overlays/OverlayInfo";
import Legend from "./Legend";
import { positionStore } from "../stores/positionStore";

function StoryVis() {
  const { plotWidth, plotHeight } = positionStore();
  return (
    <svg
      id="story"
      width="100%"
      viewBox={`0 0 ${plotWidth} ${plotHeight}`} // Maintain your calculated dimensions here for correct scaling
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
