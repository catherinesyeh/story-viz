import { storyStore } from "../store";
import {
  scenes,
  sceneLocations,
  sceneCharacters,
  sceneChunks,
} from "../utils/data";
import { character_offset, location_offset } from "../utils/consts";
import { scenePos } from "../utils/positions";

function XAxis() {
  const { locationHover, sceneHover, characterHover, setSceneHover } =
    storyStore();
  return (
    <g id="x-axis">
      {/* add scene names to x axis */}
      <g id="scenes">
        {scenes.map((scene, i) => (
          <g
            key={"scene-group" + i}
            className={
              "scene-name " +
              ((locationHover === "" &&
                sceneHover === "" &&
                characterHover === "") ||
              locationHover === sceneLocations[i] ||
              sceneHover === scene ||
              sceneCharacters[i].characters.includes(characterHover)
                ? ""
                : "faded")
            }
          >
            {sceneChunks[i].map((chunk, j) => (
              <text
                x={scenePos[i].x + j * character_offset * 1.5}
                y={scenePos[i].y}
                textAnchor="end"
                key={"scene" + i + j}
                transform={
                  "rotate(-45," +
                  (scenePos[i].x + j * character_offset * 1.5) +
                  ", " +
                  scenePos[i].y +
                  ")"
                }
                onMouseEnter={() => setSceneHover(scene)}
                onMouseLeave={() => setSceneHover("")}
              >
                {chunk}
              </text>
            ))}
          </g>
        ))}
      </g>
      {/* add arrow showing time at bottom of plot */}
      <g id="time-arrow">
        <path
          id="arrow-line"
          markerEnd="url(#head)"
          strokeWidth="2"
          fill="none"
          stroke="black"
          d={`M${scenePos[0].x},${scenePos[0].y - 0.75 * location_offset}, ${
            scenePos[scenePos.length - 1].x
          },${scenePos[0].y - 0.75 * location_offset}`}
        />
        {/* add label to arrow */}
        <text
          x={scenePos[0].x + 0.5 * character_offset}
          y={scenePos[0].y - 1.1 * location_offset}
          textAnchor="start"
          fill="black"
          className="time-label"
        >
          Time
        </text>
      </g>
    </g>
  );
}
export default XAxis;
