import Defs from "./Defs";
import YAxis from "./YAxis";
import XAxis from "./XAxis";
import ConflictCurve from "./ConflictCurve";
import MainPlot from "./MainPlot";
import OverlayInfo from "./Overlays/OverlayInfo";
import Legend from "./Legend";
import { dataStore } from "../stores/dataStore";

function StoryVis() {
  const { plot_width, plot_height } = dataStore();
  return (
    <svg
      id="story"
      width="100%"
      viewBox={`0 0 ${plot_width} ${plot_height}`} // Maintain your calculated dimensions here for correct scaling
      preserveAspectRatio="xMidYMid meet" // This helps in maintaining the aspect ratio
    >
      <Defs />
      <ConflictCurve />
      <MainPlot />
      <YAxis />
      <XAxis />
      <OverlayInfo />
      <Legend />
    </svg>
  );
}

export default StoryVis;
