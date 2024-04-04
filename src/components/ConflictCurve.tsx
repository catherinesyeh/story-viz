import { storyStore } from "../stores/storyStore";
import {
  location_offset,
  character_offset,
  character_height,
  location_height,
} from "../utils/consts";
import { dataStore } from "../stores/dataStore";
import { positionStore } from "../stores/positionStore";

function ConflictCurve() {
  const { overlay, sceneHover, locationHover, characterHover, colorBy } =
    storyStore();
  const {
    conflictPath,
    importancePath,
    scenePos,
    sceneWidth,
    yShift,
    minConflictY,
  } = positionStore();
  const { scenes } = dataStore();
  return (
    <g id="conflict-container" transform={"translate(0 " + yShift + ")"}>
      {/* add conflict curve */}
      <path
        id="conflict-curve"
        d={overlay === "importance" ? importancePath : conflictPath}
        fillOpacity={0}
        fill={colorBy === "default" ? "#ddd" : "url(#rating" + colorBy + ")"}
        strokeWidth={2}
        className={
          (overlay !== "none" ? "highlight" : "") +
          (overlay !== "none" && (locationHover !== "" || characterHover !== "")
            ? " faded"
            : "")
        }
      />
      <g
        id="overlays"
        fillOpacity={overlay === "none" || sceneHover === "" ? 0 : 0.7}
      >
        <rect
          id="left-overlay"
          className="white-overlay"
          fill="url(#white-gradient)"
          x={scenePos[0].x}
          y={minConflictY - location_height + 0.5 * character_height}
          width={
            overlay === "none" || sceneHover === ""
              ? 0
              : sceneWidth * scenes.indexOf(sceneHover)
          }
          height={location_height + 0.5 * character_height}
        />
        <rect
          id="right-overlay"
          className="white-overlay"
          fill="url(#white-gradient-right)"
          x={
            overlay === "none" || sceneHover === ""
              ? scenePos[scenePos.length - 1].x
              : scenePos[scenes.indexOf(sceneHover)].x + 0.5 * character_offset
          }
          y={minConflictY - location_height + 0.5 * character_height}
          width={
            overlay === "none" || sceneHover === ""
              ? 0
              : (scenes.length - scenes.indexOf(sceneHover) - 1) * sceneWidth
          }
          height={location_height + 0.5 * character_height}
        />
      </g>
      {/* add vertical arrow as y axis */}
      <g
        id="y-arrow"
        fillOpacity={0}
        strokeOpacity={0}
        className={overlay !== "none" ? "highlight" : ""}
      >
        <path
          id="arrow-line-y"
          markerEnd={overlay === "none" ? "" : "url(#head)"}
          strokeWidth="2"
          stroke="black"
          d={`M${scenePos[0].x},${minConflictY} , ${scenePos[0].x},${
            minConflictY - location_height + 0.5 * character_height
          }`}
        />
        {/* add label to arrow */}
        <text
          x={scenePos[0].x - 0.5 * location_offset}
          y={minConflictY || 0}
          textAnchor="start"
          className="conflict-label"
          transform={
            "rotate(-90," +
            (scenePos[0].x - 0.5 * location_offset) +
            ", " +
            minConflictY +
            ")"
          }
        >
          {overlay.charAt(0).toUpperCase() + overlay.slice(1)} (max: 1)
        </text>
      </g>
    </g>
  );
}

export default ConflictCurve;
