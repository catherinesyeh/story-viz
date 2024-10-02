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
  lengthColor,
  textColor,
} from "../utils/colors";
import {
  getFontFamily,
  getFontWeight,
  normalize,
  normalizeFontSize,
  normalizeTextOffset,
} from "../utils/helpers";
import { positionStore } from "../stores/positionStore";

function XAxis() {
  const {
    scenes,
    sceneLocations,
    sceneCharacters,
    scene_data,
    sceneChunks,
    minLines,
    maxLines,
    chapterDivisions,
    activeChapters,
  } = dataStore();
  const {
    locationHover,
    sceneHover,
    characterHover,
    setSceneHover,
    sizeBy,
    colorBy,
    weightBy,
    overlay,
    showChapters,
  } = storyStore();

  const { scenePos, yShift, minConflictY } = positionStore();

  // active chapters
  const activeChapterDivisions =
    chapterDivisions &&
    chapterDivisions.filter((_, i) => {
      return i >= activeChapters[0] - 1 && i < activeChapters[1];
    });
  const lastActiveChapter =
    activeChapterDivisions[activeChapterDivisions.length - 1];
  const numScenesInLastActiveChapter = lastActiveChapter.scenes.length;
  const activeScenes = scenes.slice(
    activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1].index +
      numScenesInLastActiveChapter
  );
  const activeScenePos = scenePos.slice(
    activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1].index +
      numScenesInLastActiveChapter
  );
  const activeSceneChunks = sceneChunks.slice(
    activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1].index +
      numScenesInLastActiveChapter
  );
  const activeSceneData = scene_data.slice(
    activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1].index +
      numScenesInLastActiveChapter
  );

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
        {/* add vertical line to separate chapters rotated by 45 deg */}
        {activeChapterDivisions &&
          activeChapterDivisions.length > 0 &&
          activeChapterDivisions.map((chapter, i) => {
            const chapterName = chapter.chapter;
            const chapterPos = scenePos[chapter.index];

            const lineLength = sizeBy === "default" ? 110 : 130;

            return (
              chapterPos &&
              chapterName && (
                <g
                  key={"chapter" + i}
                  transform={
                    "rotate(45," +
                    (chapterPos.x - 2 * character_offset) +
                    ", " +
                    chapterPos.y +
                    ")"
                  }
                  className={
                    "chapter-line-group " +
                    (showChapters ? "" : "hidden ") +
                    ((locationHover === "" &&
                      sceneHover === "" &&
                      characterHover === "") ||
                    chapter.locations.includes(locationHover) ||
                    chapter.scenes.includes(sceneHover) ||
                    chapter.characters.includes(characterHover)
                      ? ""
                      : "faded")
                  }
                >
                  <line
                    x1={chapterPos.x - 2 * character_offset}
                    x2={chapterPos.x - 2 * character_offset}
                    y1={chapterPos.y - location_offset}
                    y2={chapterPos.y + lineLength}
                    stroke="gray"
                    strokeWidth="1"
                    strokeDasharray={"4"}
                    className="chapter-line"
                  />
                  <text
                    x={chapterPos.x - 1.75 * character_offset}
                    y={chapterPos.y + lineLength + 5}
                    textAnchor="end"
                    fill="gray"
                    className="chapter-label"
                    transform={
                      "rotate(-90," +
                      (chapterPos.x - 1.75 * character_offset) +
                      ", " +
                      (chapterPos.y + lineLength + 5) +
                      ")"
                    }
                    fontSize={"smaller"}
                  >
                    {chapterName.startsWith("Act")
                      ? chapterName
                      : "Ch. " + chapterName}
                  </text>
                </g>
              )
            );
          })}
        {activeScenes.map((scene, i) => (
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
            {activeSceneChunks[i].map((chunk, j) => {
              const ratings = activeSceneData[i].ratings;
              const numLines = normalize(
                activeSceneData[i].numLines,
                minLines,
                maxLines,
                0,
                1
              );
              const textOffset =
                sizeBy === "default"
                  ? 1.5
                  : sizeBy === "conflict"
                  ? normalizeTextOffset(ratings.conflict)
                  : sizeBy === "importance"
                  ? normalizeTextOffset(ratings.importance)
                  : normalizeTextOffset(numLines);

              const fontSize =
                sizeBy === "default"
                  ? 0.8
                  : sizeBy === "conflict"
                  ? normalizeFontSize(ratings.conflict) +
                    (ratings.conflict >= 0.66 ? 0.2 : 0)
                  : sizeBy === "importance"
                  ? normalizeFontSize(ratings.importance) +
                    (ratings.conflict >= 0.66 ? 0.2 : 0)
                  : normalizeFontSize(numLines) +
                    (ratings.conflict >= 0.66 ? 0.2 : 0);

              const color =
                colorBy === "default"
                  ? "black"
                  : colorBy === "sentiment"
                  ? emotionColor(ratings.sentiment)
                  : colorBy === "conflict"
                  ? conflictColor(ratings.conflict)
                  : colorBy === "importance"
                  ? importanceColor(ratings.importance)
                  : lengthColor(numLines);

              const weight =
                weightBy === "importance"
                  ? getFontWeight(ratings.importance)
                  : weightBy === "conflict"
                  ? getFontWeight(ratings.conflict)
                  : weightBy === "length"
                  ? getFontWeight(numLines)
                  : 500;

              const letterSpacing =
                ratings.conflict >= 0.66
                  ? fontSize > 1.2 && weight > 600
                    ? 4.5
                    : fontSize > 1 && weight > 400
                    ? 3
                    : 1.5
                  : 0;

              return (
                activeScenePos[i] && (
                  <text
                    x={activeScenePos[i].x + j * character_offset * textOffset}
                    y={activeScenePos[i].y + 0.25 * character_height}
                    textAnchor="end"
                    key={"scene" + i + j}
                    fill={color}
                    className="scene-name-text"
                    fontSize={"calc(" + fontSize + "rem + 0.1vw)"}
                    letterSpacing={letterSpacing}
                    fontWeight={weight}
                    fontFamily={getFontFamily(ratings.conflict)}
                    transform={
                      "rotate(-45," +
                      (activeScenePos[i].x +
                        j * character_offset * textOffset) +
                      ", " +
                      (activeScenePos[i].y + 0.25 * character_height) +
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
              : colorBy === "importance"
              ? textColor(scene_data[0].ratings.importance, false)
              : textColor(
                  normalize(scene_data[0].numLines, minLines, maxLines, 0, 1),
                  false
                )
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
