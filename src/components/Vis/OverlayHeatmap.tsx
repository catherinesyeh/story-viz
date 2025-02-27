import { storyStore } from "../../stores/storyStore";
import { character_height, character_offset } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import {
  conflictColor,
  emotionColor,
  importanceColor,
  lengthColor,
  numCharsColor,
} from "../../utils/colors";
import chroma from "chroma-js";
import { activeAttrInScene, normalize } from "../../utils/helpers";

function OverlayHeatmap() {
  const {
    showOverlay,
    sceneHover,
    locationHover,
    characterHover,
    colorBy,
    groupHover,
    customHover,
    characterColor,
    setSceneHover,
    linkHover,
    chapterHover,
    setChapterHover,
    detailView,
    chapterView,
    setDetailView,
  } = storyStore();
  const { scenePos } = positionStore();
  const {
    scene_data,
    minLines,
    maxLines,
    sceneCharacters,
    character_data,
    activeChapters,
    chapterDivisions,
  } = dataStore();

  const maxCharsInScene = Math.max(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );
  const minCharsInScene = Math.min(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );

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
  const activeSceneData = scene_data.slice(
    activeChapterDivisions[0] && activeChapterDivisions[0].index,
    activeChapterDivisions[activeChapterDivisions.length - 1] &&
      activeChapterDivisions[activeChapterDivisions.length - 1].index +
        numScenesInLastActiveChapter
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
    <g id="conflict-container">
      {/* add conflict squares */}
      <g id="conflict-curve" className={showOverlay ? "highlight" : ""}>
        {activeSceneData.map((scene, i) => {
          const ratings = scene.ratings;
          const numLines = normalize(scene.numLines, minLines, maxLines, 0, 1);
          const sceneChars = normalize(
            scene.characters.length,
            minCharsInScene,
            maxCharsInScene,
            0,
            1
          );

          const scene_index = scene_data.indexOf(scene);

          const color =
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

          let startX = scenePos[scene_index] && scenePos[scene_index].x;
          startX -=
            scene_index == 0
              ? 1.25 * character_offset
              : 0.5 *
                (scenePos[scene_index] &&
                  scenePos[scene_index - 1] &&
                  scenePos[scene_index].x - scenePos[scene_index - 1].x);

          let endX = scenePos[scene_index] && scenePos[scene_index].x;
          endX +=
            scene_index == scenePos.length - 1
              ? 1.25 * character_offset
              : 0.5 *
                (scenePos[scene_index + 1] &&
                  scenePos[scene_index] &&
                  scenePos[scene_index + 1].x - scenePos[scene_index].x);
          return (
            <rect
              className={
                "conflict-rect " +
                (showOverlay ? "" : "hide ") +
                ((locationHover === "" &&
                  sceneHover === "" &&
                  characterHover === "" &&
                  linkHover.length === 0 &&
                  groupHover === "" &&
                  customHover === "") ||
                locationHover === scene.location ||
                sceneHover === scene.name ||
                sceneCharacters[i].characters.includes(characterHover) ||
                sceneCharacters[i].characters.filter((char) =>
                  linkHover.includes(char)
                ).length > 0 ||
                sceneCharacters[i].groups.includes(groupHover) ||
                activeAttrInScene(
                  sceneCharacters[i].characters,
                  character_data,
                  characterColor,
                  customHover
                )
                  ? ""
                  : "faded")
              }
              key={i}
              x={startX}
              y={character_offset - 0.5 * character_height}
              width={endX - startX}
              height={character_offset}
              fill={colorBy === "default" ? "#ddd" : color}
              onMouseEnter={() => {
                setSceneHover(scene.name);
              }}
              onMouseLeave={() => {
                setSceneHover("");
              }}
              onClick={() => {
                updateChapterHover(scene.name);
              }}
            />
          );
        })}
      </g>
    </g>
  );
}

export default OverlayHeatmap;
