import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import {
  character_height,
  character_offset,
  extra_yshift,
  location_offset,
} from "../utils/consts";
import {
  conflictColor,
  emotionColor,
  importanceColor,
  textColor,
} from "../utils/colors";
import {
  getFontFamily,
  getFontWeight,
  normalizeFontSize,
  normalizeTextOffset,
} from "../utils/helpers";
import { positionStore } from "../stores/positionStore";

function XAxis() {
  const { scenes, sceneLocations, sceneCharacters, scene_data, sceneChunks } =
    dataStore();
  const {
    locationHover,
    sceneHover,
    characterHover,
    setSceneHover,
    sizeBy,
    colorBy,
    weightBy,
    overlay,
  } = storyStore();

  const { scenePos, yShift, minConflictY } = positionStore();

  return (
    <g
      id="x-axis"
      transform={
        "translate(0 " +
        (yShift +
          (overlay !== "none" ? extra_yshift(minConflictY, scenePos) : 0)) +
        ")"
      }
    >
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
            {sceneChunks[i].map((chunk, j) => {
              const ratings = scene_data[i].ratings;
              const textOffset =
                sizeBy === "default"
                  ? 1.5
                  : sizeBy === "conflict"
                  ? normalizeTextOffset(ratings.conflict)
                  : normalizeTextOffset(ratings.importance);
              const fontSize =
                sizeBy === "default"
                  ? 0.8
                  : sizeBy === "conflict"
                  ? normalizeFontSize(ratings.conflict) +
                    (ratings.conflict >= 0.66 ? 0.2 : 0)
                  : normalizeFontSize(ratings.importance) +
                    (ratings.conflict >= 0.66 ? 0.2 : 0);
              const color =
                colorBy === "default"
                  ? "black"
                  : colorBy === "sentiment"
                  ? emotionColor(ratings.sentiment)
                  : colorBy === "conflict"
                  ? conflictColor(ratings.conflict)
                  : importanceColor(ratings.importance);

              const letterSpacing =
                ratings.conflict >= 0.66
                  ? ratings.conflict > 0.88
                    ? 3
                    : 1.5
                  : 0;
              return (
                scenePos[i] && (
                  <text
                    x={scenePos[i].x + j * character_offset * textOffset}
                    y={scenePos[i].y + 0.25 * character_height}
                    textAnchor="end"
                    key={"scene" + i + j}
                    fill={color}
                    className="scene-name-text"
                    fontSize={"calc(" + fontSize + "rem + 0.1vw)"}
                    letterSpacing={letterSpacing}
                    fontWeight={
                      weightBy === "importance"
                        ? getFontWeight(ratings.importance)
                        : weightBy === "conflict"
                        ? getFontWeight(ratings.conflict)
                        : "500"
                    }
                    fontFamily={getFontFamily(ratings.conflict)}
                    transform={
                      "rotate(-45," +
                      (scenePos[i].x + j * character_offset * textOffset) +
                      ", " +
                      (scenePos[i].y + 0.25 * character_height) +
                      ")"
                    }
                    onMouseEnter={() => setSceneHover(scene)}
                    onMouseLeave={() => setSceneHover("")}
                  >
                    {chunk}
                  </text>
                )
              );
            })}
          </g>
        ))}
      </g>
      {/* add arrow showing time at bottom of plot */}
      <g id="time-arrow">
        <path
          id="arrow-line"
          markerEnd="url(#head)"
          strokeWidth="2"
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
          fill={
            overlay === "none" || colorBy === "default"
              ? "black"
              : colorBy === "conflict"
              ? textColor(scene_data[0].ratings.conflict, false)
              : colorBy === "sentiment"
              ? textColor(scene_data[0].ratings.sentiment, true)
              : textColor(scene_data[0].ratings.importance, false)
          }
          className="time-label"
        >
          Time
        </text>
      </g>
    </g>
  );
}
export default XAxis;
