import { storyStore } from "../stores/storyStore";
import { color_dict } from "../utils/colors";
import {
  character_height,
  character_offset,
  extra_yshift,
} from "../utils/consts";
import { dataStore } from "../stores/dataStore";
import { positionStore } from "../stores/positionStore";

function Legend() {
  const { minLines, maxLines } = dataStore();
  const { colorBarPos, minConflictY, scenePos } = positionStore();
  const {
    sceneHover,
    colorBy,
    characterColor: characterColorBy,
    sizeBy,
    overlay,
  } = storyStore();

  return (
    <g id="legends">
      {/* add rectangular bar across bottom of plot to serve as color bar legend */}
      <g
        id="color-legends"
        transform={
          "translate(0 " +
          (overlay !== "none" ? extra_yshift(minConflictY, scenePos) : 0) +
          ")"
        }
      >
        {Object.keys(color_dict).map((scale, i) => (
          <g
            className={
              "color-legend " +
              (sceneHover !== "" ||
              colorBy !== "default" ||
              (characterColorBy !== "default" && characterColorBy !== "llm")
                ? "highlight"
                : "")
            }
            key={"color legend bar" + scale}
            opacity={0}
          >
            <text
              x={colorBarPos[i].x - 0.75 * character_offset}
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y + character_height
                  : colorBarPos[i].y + character_height + 4 * character_offset
              }
              textAnchor="end"
              fill="black"
              className="legend-label"
            >
              {scale === "sentiment" ? -1 : scale === "length" ? minLines : 0}
            </text>
            <rect
              id="legend-bar"
              x={colorBarPos[i].x}
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y
                  : colorBarPos[i].y + 4 * character_offset
              }
              width={colorBarPos[i].width}
              height={colorBarPos[i].height}
              fill={"url(#legend" + scale + ")"}
            />
            <text
              x={colorBarPos[i].x + colorBarPos[i].width / 2}
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y + 2.4 * character_height
                  : colorBarPos[i].y +
                    2.4 * character_height +
                    4 * character_offset
              }
              textAnchor="middle"
            >
              {scale === "length" ? "length (# lines)" : scale}
            </text>
            <text
              x={
                colorBarPos[i].x +
                colorBarPos[i].width +
                0.75 * character_offset
              }
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y + character_height
                  : colorBarPos[i].y + character_height + 4 * character_offset
              }
              textAnchor="start"
              fill="black"
              className="legend-label"
            >
              {scale === "length" ? maxLines : 1}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

export default Legend;
