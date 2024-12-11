import { storyStore } from "../../stores/storyStore";
import {
  location_offset,
  character_offset,
  character_height,
  location_height,
  location_buffer,
} from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";

function OverlayCurve() {
  const { showOverlay, sceneHover, locationHover, characterHover, colorBy } =
    storyStore();
  const { conflictPath, importancePath, lengthPath, scenePos } =
    positionStore();
  const { scenes } = dataStore();
  return (
    <g
      id="conflict-container"
      transform={
        "translate(0 " + (showOverlay ? -0.5 * character_height : 0) + ")"
      }
    >
      {/* add conflict curve */}
      <path
        id="conflict-curve"
        d={
          colorBy === "importance"
            ? importancePath
            : colorBy === "conflict"
            ? conflictPath
            : lengthPath
        }
        fillOpacity={0}
        fill={colorBy === "default" ? "#ddd" : "url(#rating" + colorBy + ")"}
        strokeWidth={2}
        className={
          (showOverlay ? "highlight" : "") +
          (showOverlay && (locationHover !== "" || characterHover !== "")
            ? " faded"
            : "")
        }
      />
      <g
        id="overlays"
        fillOpacity={!showOverlay || sceneHover === "" ? 0 : 0.7}
      >
        <rect
          id="left-overlay"
          className="white-overlay"
          fill="url(#white-gradient)"
          x={scenePos[0] && scenePos[0].x - 1.25 * character_offset}
          y={location_buffer - location_height + 0.5 * character_height}
          width={
            !showOverlay ||
            sceneHover === "" ||
            (sceneHover !== "" && !scenePos[scenes.indexOf(sceneHover)])
              ? 0
              : scenePos[scenes.indexOf(sceneHover)] &&
                scenePos[0] &&
                scenePos[scenes.indexOf(sceneHover)].x -
                  scenePos[0].x +
                  1.25 * character_offset
          }
          height={location_height + 0.5 * character_height}
        />
        <rect
          id="right-overlay"
          className="white-overlay"
          fill="url(#white-gradient-right)"
          x={
            !showOverlay ||
            sceneHover === "" ||
            (sceneHover !== "" && !scenePos[scenes.indexOf(sceneHover)])
              ? scenePos[scenePos.length - 1] &&
                scenePos[scenePos.length - 1].x + 1.25 * character_offset
              : scenePos[scenes.indexOf(sceneHover)] &&
                scenePos[scenes.indexOf(sceneHover)].x + 0.5 * character_offset
          }
          y={location_buffer - location_height + 0.5 * character_height}
          width={
            !showOverlay ||
            sceneHover === "" ||
            (sceneHover !== "" && !scenePos[scenes.indexOf(sceneHover)])
              ? 0
              : scenePos[scenePos.length - 1] &&
                scenePos[scenes.indexOf(sceneHover)] &&
                scenePos[scenePos.length - 1].x -
                  scenePos[scenes.indexOf(sceneHover)].x +
                  1.25 * character_offset
          }
          height={location_height + 0.5 * character_height}
        />
      </g>
      {/* add vertical arrow as y axis */}
      <g
        id="y-arrow"
        fillOpacity={0}
        strokeOpacity={0}
        className={showOverlay ? "highlight" : ""}
      >
        <path
          id="arrow-line-y"
          markerEnd={!showOverlay ? "" : "url(#head)"}
          strokeWidth="2"
          stroke="black"
          d={`M${
            scenePos[0] && scenePos[0].x - 1.25 * character_offset
          },${location_buffer} , ${
            scenePos[0] && scenePos[0].x - 1.25 * character_offset
          },${location_buffer - location_height + 0.5 * character_height}`}
        />
        {/* add label to arrow */}
        <text
          x={scenePos[0] && scenePos[0].x - 1.5 * location_offset}
          y={location_buffer || 0}
          textAnchor="start"
          className="conflict-label"
          transform={
            "rotate(-90," +
            (scenePos[0] && scenePos[0].x - 1.5 * location_offset) +
            ", " +
            location_buffer +
            ")"
          }
        >
          {colorBy.charAt(0).toUpperCase() + colorBy.slice(1)} (max: 1)
        </text>
      </g>
    </g>
  );
}

export default OverlayCurve;
