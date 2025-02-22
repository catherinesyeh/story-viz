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
import { useEffect } from "react";

function OverlayCurve() {
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
  } = storyStore();
  const { scenePos } = positionStore();
  const { scene_data, minLines, maxLines, sceneCharacters, character_data } =
    dataStore();

  const maxCharsInScene = Math.max(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );
  const minCharsInScene = Math.min(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );

  useEffect(() => {
    console.log("locationHover", locationHover);
  }, [locationHover]);

  return (
    <g id="conflict-container">
      {/* add conflict squares */}
      <g id="conflict-curve" className={showOverlay ? "highlight" : ""}>
        {scene_data.map((scene, i) => {
          const ratings = scene.ratings;
          const numLines = normalize(scene.numLines, minLines, maxLines, 0, 1);
          const sceneChars = normalize(
            scene.characters.length,
            minCharsInScene,
            maxCharsInScene,
            0,
            1
          );

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

          let startX = scenePos[i] && scenePos[i].x;
          startX -=
            i == 0
              ? 1.25 * character_offset
              : 0.5 *
                (scenePos[i] &&
                  scenePos[i - 1] &&
                  scenePos[i].x - scenePos[i - 1].x);

          let endX = scenePos[i] && scenePos[i].x;
          endX +=
            i == scenePos.length - 1
              ? 1.25 * character_offset
              : 0.5 *
                (scenePos[i + 1] &&
                  scenePos[i] &&
                  scenePos[i + 1].x - scenePos[i].x);
          return (
            <rect
              className={
                "conflict-rect " +
                (showOverlay ? "" : "hide ") +
                ((locationHover === "" &&
                  sceneHover === "" &&
                  characterHover === "" &&
                  groupHover === "" &&
                  customHover === "") ||
                locationHover === scene.location ||
                sceneHover === scene.name ||
                sceneCharacters[i].characters.includes(characterHover) ||
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
            />
          );
        })}
      </g>
    </g>
  );
}

export default OverlayCurve;
