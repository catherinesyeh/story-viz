import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import {
  character_height,
  character_offset,
  location_offset,
  med_conflict_font,
} from "../../utils/consts";
import {
  conflictColor,
  emotionColor,
  importanceColor,
  lengthColor,
  numCharsColor,
  textColor,
} from "../../utils/colors";
import {
  activeAttrInScene,
  chapterFormatted,
  extractChapterName,
  getFontWeight,
  normalize,
  normalizeFontSize,
  normalizeTextOffset,
} from "../../utils/helpers";
import { positionStore } from "../../stores/positionStore";
import chroma from "chroma-js";

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
    character_data,
  } = dataStore();
  const {
    locationHover,
    sceneHover,
    characterHover,
    setSceneHover,
    sizeBy,
    colorBy,
    weightBy,
    showOverlay,
    showChapters,
    groupHover,
    customHover,
    chapterHover,
    setChapterHover,
    chapterView,
    detailView,
    setDetailView,
    characterColor,
  } = storyStore();

  const { scenePos } = positionStore();

  // active chapters
  const activeChapterDivisions =
    chapterDivisions &&
    chapterDivisions.filter((_, i) => {
      return i >= activeChapters[0] - 1 && i < activeChapters[1];
    });
  const lastActiveChapter =
    activeChapterDivisions[activeChapterDivisions.length - 1];
  const numScenesInLastActiveChapter =
    lastActiveChapter &&
    lastActiveChapter.scenes &&
    lastActiveChapter.scenes.length;
  const activeScenes = scenes.slice(
    activeChapterDivisions[0] && activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1] &&
      activeChapterDivisions[activeChapterDivisions.length - 1].index +
        numScenesInLastActiveChapter
  );
  const activeScenePos = scenePos.slice(
    activeChapterDivisions[0] && activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1] &&
      activeChapterDivisions[activeChapterDivisions.length - 1].index +
        numScenesInLastActiveChapter
  );
  const activeSceneChunks = sceneChunks.slice(
    activeChapterDivisions[0] && activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1] &&
      activeChapterDivisions[activeChapterDivisions.length - 1].index +
        numScenesInLastActiveChapter
  );
  const activeSceneData = scene_data.slice(
    activeChapterDivisions[0] && activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1] &&
      activeChapterDivisions[activeChapterDivisions.length - 1].index +
        numScenesInLastActiveChapter
  );
  const maxChars = 24;

  const maxCharsInScene = Math.max(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );
  const minCharsInScene = Math.min(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );

  const updateChapterHover = (sceneName: string) => {
    if (chapterView) {
      const scene = scene_data.find((s) => s.name === sceneName);
      if (scene) {
        if (chapterHover === "" && !detailView) {
          setDetailView(true);
        }
        if (scene.name !== chapterHover) {
          setChapterHover(scene.name);
        } else {
          setChapterHover("");
          if (detailView) {
            setDetailView(false);
          }
        }
      }
    }
  };

  return (
    <g id="x-axis" transform={"translate(0 " + 0.25 * character_offset + ")"}>
      {/* add scene names to x axis */}
      <g id="scenes">
        {/* add vertical line to separate chapters rotated by 45 deg */}
        {activeChapterDivisions &&
          activeChapterDivisions.length > 0 &&
          activeChapterDivisions.map((chapter, i) => {
            let chapterName = chapter.chapter;

            // also if it's something like "Chapter 1 The Beginning" only take "Chapter 1"
            if (chapterName) {
              chapterName = extractChapterName(chapterName);
            }

            const chapterPos = scenePos[chapter.index];

            const lineLength = sizeBy === "default" ? 40 : 60;

            return (
              chapterPos &&
              chapterName && (
                <g
                  key={"chapter" + i}
                  transform={
                    "rotate(45," +
                    (chapterPos.x - 2 * character_offset) +
                    ", " +
                    location_offset * 2 +
                    ")"
                  }
                  className={
                    "chapter-line-group " +
                    (showChapters ? "" : "hidden ") +
                    ((locationHover === "" &&
                      sceneHover === "" &&
                      characterHover === "" &&
                      groupHover === "" &&
                      customHover === "") ||
                    chapter.locations.includes(locationHover) ||
                    chapter.scenes.includes(sceneHover) ||
                    chapter.characters.includes(characterHover) ||
                    chapter.groups.includes(groupHover) ||
                    (customHover !== "" &&
                      activeAttrInScene(
                        chapter.characters,
                        character_data,
                        characterColor,
                        customHover
                      ))
                      ? ""
                      : "faded")
                  }
                >
                  <line
                    x1={chapterPos.x - 2 * character_offset}
                    x2={chapterPos.x - 2 * character_offset}
                    y1={location_offset * 2 - location_offset}
                    y2={location_offset * 2 + lineLength}
                    stroke="black"
                    strokeWidth="2"
                    // strokeDasharray={"4"}
                    className="chapter-line"
                  />
                  <text
                    x={chapterPos.x - 1.75 * character_offset}
                    y={location_offset * 2 + lineLength + 5}
                    textAnchor="end"
                    fill="black"
                    fontWeight={"bold"}
                    className="chapter-label"
                    transform={
                      "rotate(-90," +
                      (chapterPos.x - 1.75 * character_offset) +
                      ", " +
                      (location_offset * 2 + lineLength + 5) +
                      ")"
                    }
                    fontSize={"smaller"}
                  >
                    {chapterFormatted(chapterName)
                      ? chapterName.length > maxChars
                        ? chapterName.slice(0, maxChars) + "..."
                        : chapterName
                      : "Ch. " +
                        (chapterName.length > maxChars
                          ? chapterName.slice(0, maxChars - 4) + "..."
                          : chapterName)}
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
                characterHover === "" &&
                groupHover === "" &&
                customHover === "") ||
              locationHover === sceneLocations[i] ||
              sceneHover === scene ||
              sceneCharacters[i].characters.includes(characterHover) ||
              sceneCharacters[i].groups.includes(groupHover) ||
              (customHover !== "" &&
                activeAttrInScene(
                  sceneCharacters[i].characters,
                  character_data,
                  characterColor,
                  customHover
                ))
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
              const sceneChars = normalize(
                activeSceneData[i].characters.length,
                minCharsInScene,
                maxCharsInScene,
                0,
                1
              );
              const textOffset =
                sizeBy === "default"
                  ? 1.5
                  : sizeBy === "conflict"
                  ? normalizeTextOffset(ratings?.conflict)
                  : sizeBy === "importance"
                  ? normalizeTextOffset(ratings?.importance)
                  : sizeBy === "numChars"
                  ? normalizeTextOffset(sceneChars)
                  : normalizeTextOffset(numLines);

              let fontSize =
                sizeBy === "default"
                  ? 0.8
                  : sizeBy === "conflict"
                  ? normalizeFontSize(ratings?.conflict) +
                    (ratings?.conflict >= 0.66 ? 0.2 : 0)
                  : sizeBy === "importance"
                  ? normalizeFontSize(ratings?.importance) +
                    (ratings?.conflict >= 0.66 ? 0.2 : 0)
                  : sizeBy === "numChars"
                  ? normalizeFontSize(sceneChars) +
                    (ratings?.conflict >= 0.66 ? 0.2 : 0)
                  : normalizeFontSize(numLines) +
                    (ratings?.conflict >= 0.66 ? 0.2 : 0);

              if (showChapters) {
                fontSize = fontSize / 2;
              }

              let color =
                colorBy === "default"
                  ? "black"
                  : colorBy === "sentiment"
                  ? chroma(emotionColor(ratings?.sentiment)).css()
                  : colorBy === "conflict"
                  ? chroma(conflictColor(ratings?.conflict)).css()
                  : colorBy === "importance"
                  ? chroma(importanceColor(ratings?.importance)).css()
                  : colorBy === "numChars"
                  ? chroma(numCharsColor(sceneChars)).css()
                  : chroma(lengthColor(numLines)).css();

              // make color transparent if showChapters is true
              if (showChapters) {
                color = color.replace(")", ", 0.5)");
              }

              const weight =
                weightBy === "importance"
                  ? getFontWeight(ratings?.importance)
                  : weightBy === "conflict"
                  ? getFontWeight(ratings?.conflict)
                  : weightBy === "length"
                  ? getFontWeight(numLines)
                  : weightBy === "numChars"
                  ? getFontWeight(sceneChars)
                  : 500;

              // const letterSpacing =
              //   ratings.conflict >= 0.66
              //     ? fontSize > 1.2 && weight > 600
              //       ? 4.5
              //       : fontSize > 1 && weight > 400
              //       ? 3
              //       : 1.5
              //     : 0;

              return (
                activeScenePos[i] && (
                  <text
                    x={
                      activeScenePos[i].x +
                      j *
                        character_offset *
                        textOffset *
                        (showChapters ? 0.6 : 1)
                    }
                    y={location_offset * 2 + 0.25 * character_height}
                    textAnchor="end"
                    key={"scene" + i + j}
                    fill={color}
                    className={
                      "scene-name-text " +
                      (chapterHover === scene ? "frozen" : "")
                    }
                    fontSize={"calc(" + fontSize + "rem + 0.1vw)"}
                    // letterSpacing={letterSpacing}
                    fontWeight={weight}
                    fontFamily={med_conflict_font}
                    // fontFamily={getFontFamily(ratings.conflict)}
                    transform={
                      "rotate(-45," +
                      (activeScenePos[i].x +
                        j *
                          character_offset *
                          textOffset *
                          (showChapters ? 0.6 : 1)) +
                      ", " +
                      (location_offset * 2 + 0.25 * character_height) +
                      ")"
                    }
                    onMouseEnter={() => setSceneHover(scene)}
                    onMouseLeave={() => setSceneHover("")}
                    onClick={() => updateChapterHover(scene)}
                  >
                    {chapterHover === scene && "⭐ "}
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
          d={`M${scenePos[0] && scenePos[0].x - 1.25 * character_offset},${
            location_offset * 2 - 0.75 * location_offset
          }, ${
            scenePos[scenePos.length - 1] &&
            scenePos[scenePos.length - 1].x + 1.25 * character_offset
          },${location_offset * 2 - 0.75 * location_offset}`}
        />
        {/* add label to arrow */}
        <text
          x={scenePos[0] && scenePos[0].x - 0.75 * character_offset}
          y={location_offset}
          textAnchor="start"
          fill={
            !showOverlay || colorBy === "default"
              ? "black"
              : colorBy === "conflict"
              ? textColor(scene_data[0].ratings?.conflict, false)
              : colorBy === "sentiment"
              ? textColor(scene_data[0].ratings?.sentiment, true)
              : colorBy === "importance"
              ? textColor(scene_data[0].ratings?.importance, false)
              : colorBy === "# characters"
              ? textColor(
                  normalize(
                    scene_data[0].characters.length,
                    minCharsInScene,
                    maxCharsInScene,
                    0,
                    1
                  ),
                  false
                )
              : textColor(
                  normalize(scene_data[0].numLines, minLines, maxLines, 0, 1),
                  false
                )
          }
          className={"time-label "}
        >
          Time
        </text>
      </g>
    </g>
  );
}
export default XAxis;
