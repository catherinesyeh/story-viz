import { storyStore } from "../stores/storyStore";
import {
  location_offset,
  character_offset,
  character_height,
} from "../utils/consts";
import { dataStore } from "../stores/dataStore";
import { positionStore } from "../stores/positionStore";

function ConflictCurve() {
  const { showConflict, sceneHover, locationHover, characterHover, colorBy } =
    storyStore();
  const { conflictPath, scenePos, sceneWidth, yShift } = positionStore();
  const { scenes } = dataStore();
  return (
    <g id="conflict-container" transform={"translate(0 " + yShift + ")"}>
      {/* add conflict curve */}
      <path
        id="conflict-curve"
        d={conflictPath}
        fillOpacity={0}
        fill={colorBy === "default" ? "#ccc" : "url(#rating" + colorBy + ")"}
        strokeWidth={2}
        className={
          (showConflict ? "highlight" : "") +
          (showConflict && (locationHover !== "" || characterHover !== "")
            ? " faded"
            : "")
        }
      />
      <g
        id="overlays"
        fillOpacity={!showConflict || sceneHover === "" ? 0 : 0.7}
      >
        <rect
          id="left-overlay"
          className="white-overlay"
          fill="url(#white-gradient)"
          x={scenePos[0].x}
          y={0}
          width={
            !showConflict || sceneHover === ""
              ? 0
              : sceneWidth * scenes.indexOf(sceneHover) - character_height
          }
          height={scenePos[0].y - 0.75 * location_offset}
        />
        <rect
          id="right-overlay"
          className="white-overlay"
          fill="url(#white-gradient-right)"
          x={
            !showConflict || sceneHover === ""
              ? scenePos[scenePos.length - 1].x
              : scenePos[scenes.indexOf(sceneHover)].x + 0.5 * character_offset
          }
          y={0}
          width={
            !showConflict || sceneHover === ""
              ? 0
              : (scenes.length - scenes.indexOf(sceneHover) - 1) * sceneWidth
          }
          height={scenePos[0].y - 0.75 * location_offset}
        />
      </g>
    </g>
  );
}

export default ConflictCurve;
