import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import {
  emotionColor,
  getColor,
  getLLMColor,
  importanceColor,
} from "../utils/colors";
import { character_height } from "../utils/consts";
import { positionStore } from "../stores/positionStore";
import { normalizeMarkerSize } from "../utils/helpers";

function MainPlot() {
  const {
    sceneHover,
    setSceneHover,
    locationHover,
    characterHover,
    setCharacterHover,
    characterColor: characterColorBy,
    hidden,
  } = storyStore();
  const { sceneBoxes, characterPaths, characterPos, characterSquares, yShift } =
    positionStore();
  const {
    scene_data,
    sceneCharacters,
    sceneLocations,
    characterScenes,
    scenes,
    sortedCharacters,
  } = dataStore();
  return (
    <g id="main-plot" transform={"translate(0 " + yShift + ")"}>
      {/* white boxes behind each scene */}
      <g id="scene-box-fills">
        {sceneCharacters.map(
          (scene, i) =>
            sceneBoxes[i] && (
              <rect
                className={
                  "scene-box-fill " +
                  (locationHover === sceneLocations[i] ||
                  sceneHover === scene.scene ||
                  scene.characters.includes(characterHover)
                    ? "highlight"
                    : "")
                }
                x={sceneBoxes[i].x}
                y={sceneBoxes[i].y}
                width={sceneBoxes[i].width}
                height={sceneBoxes[i].height}
                fillOpacity={0}
                fill="white"
                key={"scenegroup fill" + i}
              />
            )
        )}
      </g>
      {/* add characters to each scene */}
      <g id="character-paths">
        {characterScenes.map((character, i) => {
          const firstScene = character.scenes[0];
          const charColor = getColor(character.character, sortedCharacters);

          const llmColor =
            getLLMColor(character.character, sortedCharacters) || charColor;

          return (
            <g
              key={"chargroup" + i}
              className={
                "character-path " +
                character.character +
                " " +
                (hidden.includes(character.character) ? "hidden" : "") +
                " " +
                (characterHover !== "" && characterHover !== character.character
                  ? "faded"
                  : "")
              }
            >
              {/* add paths between scenes */}
              <g
                fillOpacity={0.7}
                strokeOpacity={0.5}
                className={
                  "path-group " +
                  (locationHover !== "" ||
                  sceneHover !== "" ||
                  (characterHover !== "" &&
                    characterHover !== character.character)
                    ? "faded"
                    : "")
                }
              >
                {characterPaths[i] &&
                  characterPaths[i].map((path, j) => (
                    <path
                      d={path}
                      fill={"url(#linear" + i + ")"}
                      stroke={"url(#linear" + i + ")"}
                      key={"charpath" + j}
                      strokeWidth={1.5}
                      paintOrder={"stroke"}
                      onMouseEnter={() =>
                        setCharacterHover(character.character)
                      }
                      onMouseLeave={() => setCharacterHover("")}
                    />
                  ))}
              </g>

              {/* add squares at each scene the character appears in */}
              <g className="character-squares">
                {characterSquares[i] &&
                  character.scenes.map((scene, j) => {
                    const char_data = scene_data[scene].characters.find(
                      (c) => c.name === character.character
                    ) as any;
                    const emotion_val = char_data.rating;
                    const importance_val = char_data.importance;
                    const emotion_color = emotionColor(emotion_val);
                    const importance_color = importanceColor(importance_val);

                    return (
                      characterSquares[i][j] && (
                        <rect
                          x={characterSquares[i][j].x}
                          y={characterSquares[i][j].y}
                          width={characterSquares[i][j].width}
                          height={characterSquares[i][j].height}
                          stroke={"white"}
                          strokeWidth={
                            normalizeMarkerSize(
                              importance_val * character_height
                            ) / 2.5
                          }
                          paintOrder={"stroke"}
                          fill={
                            characterColorBy === "default"
                              ? charColor
                              : characterColorBy === "llm"
                              ? llmColor
                              : characterColorBy === "sentiment"
                              ? emotion_color
                              : importance_color
                          }
                          key={"charsq" + j}
                          className={
                            "character-square " +
                            ((locationHover === "" && sceneHover === "") ||
                            locationHover === sceneLocations[scene] ||
                            scenes.indexOf(sceneHover) === scene
                              ? ""
                              : "faded")
                          }
                        />
                      )
                    );
                  })}
              </g>
              {/* add character name to the first scene they show up in */}
              <g
                className={
                  "char-name-label " +
                  ((sceneHover !== "" &&
                    !character.scenes.includes(scenes.indexOf(sceneHover))) ||
                  (locationHover !== "" &&
                    !character.locations.includes(locationHover))
                    ? "faded"
                    : "")
                }
                onMouseEnter={() => setCharacterHover(character.character)}
                onMouseLeave={() => setCharacterHover("")}
              >
                {characterPos[i] && (
                  <text
                    x={
                      firstScene === 0
                        ? characterPos[i][0].x + 1.5 * character_height
                        : characterPos[i][0].x - character_height / 2
                    }
                    y={
                      firstScene === 0
                        ? characterPos[i][0].y + 0.9 * character_height
                        : characterPos[i][0].y + 0.8 * character_height
                    }
                    textAnchor={firstScene === 0 ? "start" : "end"}
                    fill={characterColorBy === "llm" ? llmColor : charColor}
                    paintOrder="stroke"
                    stroke="rgb(255,255,255,0.8)"
                    strokeWidth={4}
                    className="character-name"
                  >
                    {sortedCharacters.find(
                      (c) => c.character === character.character
                    )?.short
                      ? sortedCharacters.find(
                          (c) => c.character === character.character
                        )?.short
                      : character.character}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </g>
      {/* add box outline for characters in each scene */}
      <g id="scene-boxes">
        {sceneCharacters.map(
          (scene, i) =>
            sceneBoxes[i] && (
              <rect
                className={
                  "scene-box " +
                  (locationHover === sceneLocations[i] ||
                  sceneHover === scene.scene ||
                  scene.characters.includes(characterHover)
                    ? "highlight"
                    : "")
                }
                x={sceneBoxes[i].x}
                y={sceneBoxes[i].y}
                width={sceneBoxes[i].width}
                height={sceneBoxes[i].height}
                fillOpacity={0}
                strokeOpacity={0}
                stroke={"rgb(0,0,0,0.7)"}
                strokeWidth={2}
                key={"scenegroup" + i}
                onMouseEnter={() => setSceneHover(scene.scene)}
                onMouseLeave={() => setSceneHover("")}
              />
            )
        )}
      </g>
    </g>
  );
}
export default MainPlot;
