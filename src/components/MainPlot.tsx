import { storyStore } from "../stores/store";
import { dataStore } from "../stores/dataStore";
import { colors, emotionColor, importanceColor } from "../utils/colors";
import {
  sceneBoxes,
  characterPaths,
  characterPos,
  characterSquares,
} from "../utils/positions";
import { character_height } from "../utils/consts";

function MainPlot() {
  const {
    showConflict,
    sceneHover,
    setSceneHover,
    locationHover,
    characterHover,
    setCharacterHover,
    characterColor,
    hidden,
  } = storyStore();
  const {
    scene_data,
    sceneCharacters,
    sceneLocations,
    characterScenes,
    scenes,
  } = dataStore();
  return (
    <g id="main-plot">
      {/* white boxes behind each scene */}
      <g id="scene-box-fills">
        {sceneCharacters.map((scene, i) => (
          <rect
            className={
              "scene-box-fill " +
              (showConflict &&
              (locationHover === sceneLocations[i] ||
                sceneHover === scene.scene ||
                scene.characters.includes(characterHover))
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
        ))}
      </g>
      {/* add characters to each scene */}
      <g id="character-paths">
        {characterScenes.map((character, i) => (
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
              {characterPaths[i].map((path, j) => (
                <path
                  d={path}
                  fill="none"
                  stroke={"url(#linear" + i + ")"}
                  key={"charpath" + j}
                  strokeWidth={2}
                  onMouseEnter={() => setCharacterHover(character.character)}
                  onMouseLeave={() => setCharacterHover("")}
                />
              ))}
            </g>
            {/* add squares at each scene the character appears in */}
            <g className="character-squares">
              {character.scenes.map((scene, j) => {
                const char_data = scene_data[scene].characters.find(
                  (c) => c.name === character.character
                ) as any;
                const emotion_val = char_data.emotion.rating;
                const importance_val = char_data.importance;
                const emotion_color = emotionColor(emotion_val);
                const importance_color = importanceColor(importance_val);

                return (
                  <rect
                    x={characterSquares[i][j].x}
                    y={characterSquares[i][j].y}
                    width={characterSquares[i][j].width}
                    height={characterSquares[i][j].height}
                    fill={
                      characterColor === "default"
                        ? colors[i]
                        : characterColor === "emotion"
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
                );
              })}
            </g>
            {/* add white rect behind character name */}
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
              {/* add character name to the first scene they show up in */}
              <text
                x={characterPos[i][0].x - character_height / 2}
                y={characterPos[i][0].y + 0.8 * character_height}
                textAnchor="end"
                fill={colors[i]}
                paintOrder="stroke"
                stroke="rgb(255,255,255,0.8)"
                strokeWidth={4}
                className="character-name"
              >
                {character.character}
              </text>
            </g>
          </g>
        ))}
      </g>
      {/* add box outline for characters in each scene */}
      <g id="scene-boxes">
        {sceneCharacters.map((scene, i) => (
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
        ))}
      </g>
    </g>
  );
}
export default MainPlot;
