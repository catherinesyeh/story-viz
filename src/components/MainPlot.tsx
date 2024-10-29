import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import {
  emotionColor,
  getColor,
  getGroupColor,
  getLLMColor,
  importanceColor,
} from "../utils/colors";
import { character_height, character_offset } from "../utils/consts";
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
    yAxis,
    showChapters,
    fullHeight,
    story,
    groupHover,
  } = storyStore();
  const {
    sceneBoxes,
    characterPaths,
    characterPos,
    characterSquares,
    firstPoints,
    lastPoints,
    scenePos,
    plotHeight,
  } = positionStore();
  const {
    scene_data,
    sceneCharacters,
    sceneLocations,
    characterScenes,
    scenes,
    sortedCharacters,
    activeChapters,
    chapterDivisions,
  } = dataStore();

  const activeChapterDivisions = chapterDivisions.filter(
    (_, i) => i >= activeChapters[0] - 1 && i < activeChapters[1]
  );
  const lastActiveChapter =
    activeChapterDivisions[activeChapterDivisions.length - 1];
  const firstActiveChapter = activeChapterDivisions[0];
  const firstActiveScene = firstActiveChapter && firstActiveChapter.index;
  const lastActiveScene =
    lastActiveChapter &&
    lastActiveChapter.index + lastActiveChapter.scenes.length;

  const activeSceneCharacters = sceneCharacters.filter(
    (_, i) => i >= firstActiveScene && i < lastActiveScene && sceneBoxes[i]
  );
  const activeSceneBoxes = sceneBoxes.filter(
    (_, i) => i >= firstActiveScene && i < lastActiveScene
  );

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  return (
    <g id="main-plot">
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
                  scene.characters.includes(characterHover) ||
                  scene.groups.includes(groupHover)
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
          const charScenes = character.scenes;
          const group = sortedCharacters.find(
            (c) => c.character === character.character
          )?.group;
          const charActiveScenes =
            charScenes &&
            charScenes.filter(
              (scene) => scene >= firstActiveScene && scene < lastActiveScene
            );
          const charActiveIndices = charActiveScenes.map((scene) =>
            charScenes.indexOf(scene)
          );
          const firstScene = charActiveScenes[0];
          const lastScene = charActiveScenes[charActiveScenes.length - 1];
          const charActiveSquares =
            charActiveIndices &&
            characterSquares[i] &&
            charActiveIndices.map((scene) => characterSquares[i][scene]);
          const charActivePos =
            charActiveIndices &&
            characterSquares[i] &&
            charActiveIndices.map((scene) => characterPos[i][scene]);
          const charColor = getColor(character.character, sortedCharacters);

          const llmColor =
            getLLMColor(character.character, sortedCharacters) || charColor;

          const groupColor = group
            ? getGroupColor(group, uniqueGroups)
            : charColor;

          const charFirstPoint = {
            x: scenePos[firstScene] && scenePos[firstScene].x,
            y: firstPoints[i] && firstPoints[i].y,
          };
          const charLastPoint = {
            x: scenePos[lastScene] && scenePos[lastScene].x,
            y: lastPoints[i] && lastPoints[i].y,
          };
          const dashColor =
            characterColorBy === "llm"
              ? llmColor
              : characterColorBy === "default"
              ? charColor
              : characterColorBy === "group"
              ? groupColor
              : "gray";

          return (
            <g
              key={"chargroup" + i}
              className={
                "character-path " +
                character.character +
                " " +
                (hidden.includes(character.character) ? "hidden" : "") +
                " " +
                ((characterHover !== "" &&
                  characterHover !== character.character) ||
                (groupHover !== "" && groupHover !== group)
                  ? "faded"
                  : "")
              }
            >
              {/* dashed line to connect gaps in character y axis view */}
              {yAxis.includes("character") && characterPaths.length > 1 && (
                <line
                  x1={charFirstPoint && charFirstPoint.x}
                  x2={charLastPoint && charLastPoint.x}
                  y1={charFirstPoint && charFirstPoint.y}
                  y2={charLastPoint && charLastPoint.y}
                  strokeOpacity={0.1}
                  stroke={dashColor}
                  strokeWidth="4"
                  strokeDasharray={"12"}
                  className={
                    "dashed-lines " +
                    (hidden.includes(character.character) ? "hidden " : "") +
                    (locationHover !== "" ||
                    sceneHover !== "" ||
                    (characterHover !== "" &&
                      characterHover !== character.character) ||
                    (groupHover !== "" && groupHover !== group)
                      ? "faded"
                      : "")
                  }
                />
              )}
              {/* add paths between scenes */}
              <g
                fillOpacity={0.7}
                strokeOpacity={0.5}
                className={
                  "path-group " +
                  (locationHover !== "" ||
                  sceneHover !== "" ||
                  (characterHover !== "" &&
                    characterHover !== character.character) ||
                  (groupHover !== "" && groupHover !== group)
                    ? "faded"
                    : "")
                }
              >
                {characterPaths[i] &&
                  characterPaths[i].map((path, j) => {
                    return (
                      <path
                        d={path}
                        fill={"url(#linear-" + i + "-" + j + ")"}
                        // fill={llmColor}
                        stroke={"url(#linear-" + i + "-" + j + ")"}
                        // stroke={llmColor}
                        key={"charpath" + j}
                        strokeWidth={1.5}
                        paintOrder={"stroke"}
                        onMouseEnter={() =>
                          setCharacterHover(character.character)
                        }
                        onMouseLeave={() => setCharacterHover("")}
                      />
                    );
                  })}
              </g>

              {/* add squares at each scene the character appears in */}
              <g className="character-squares">
                {charActiveSquares &&
                  charActiveScenes.map((scene, j) => {
                    const char_data = scene_data[scene].characters.find(
                      (c) => c.name === character.character
                    ) as any;
                    const emotion_val = char_data.rating;
                    const importance_val = char_data.importance;
                    const emotion_color = emotionColor(emotion_val);
                    const importance_color = importanceColor(importance_val);

                    return (
                      charActiveSquares[j] && (
                        <rect
                          x={charActiveSquares[j].x}
                          y={charActiveSquares[j].y}
                          width={charActiveSquares[j].width}
                          height={charActiveSquares[j].height}
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
                              : characterColorBy === "group"
                              ? groupColor
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
                {charActivePos && charActivePos[0] && (
                  <text
                    x={
                      firstScene === 0
                        ? charActivePos[0].x + 1.5 * character_height
                        : charActivePos[0].x - character_height / 2
                    }
                    y={
                      firstScene === 0
                        ? charActivePos[0].y + 0.9 * character_height
                        : charActivePos[0].y + 0.8 * character_height
                    }
                    textAnchor={firstScene === 0 ? "start" : "end"}
                    fill={
                      characterColorBy === "llm"
                        ? llmColor
                        : characterColorBy === "group"
                        ? groupColor
                        : charColor
                    }
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
        {activeSceneCharacters.map(
          (scene, i) =>
            activeSceneBoxes[i] && (
              <rect
                className={
                  "scene-box " +
                  (locationHover === sceneLocations[i] ||
                  sceneHover === scene.scene ||
                  scene.characters.includes(characterHover) ||
                  scene.groups.includes(groupHover)
                    ? "highlight"
                    : "")
                }
                x={activeSceneBoxes[i].x}
                y={activeSceneBoxes[i].y}
                width={activeSceneBoxes[i].width}
                height={activeSceneBoxes[i].height}
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
      {/* add chapter divisions */}
      <g id="chapter-lines">
        {activeChapterDivisions &&
          activeChapterDivisions.length > 0 &&
          activeChapterDivisions[0].chapter &&
          activeChapterDivisions.map((chapter, i) => {
            const chapterPos = scenePos[chapter.index];
            const chapterX = chapterPos && chapterPos.x - character_offset;
            return (
              <line
                x1={chapterX}
                x2={chapterX}
                y1={0}
                y2={plotHeight}
                stroke={"rgb(0,0,0,0.7)"}
                strokeWidth={2}
                strokeDasharray={
                  story.includes("-new") && !fullHeight ? "4" : "8"
                }
                key={"chapterline" + i}
                className={
                  "chapterline " +
                  (showChapters ? "" : "hidden ") +
                  ((locationHover === "" &&
                    sceneHover === "" &&
                    characterHover === "" &&
                    groupHover === "") ||
                  chapter.locations.includes(locationHover) ||
                  chapter.scenes.includes(sceneHover) ||
                  chapter.characters.includes(characterHover) ||
                  chapter.groups.includes(groupHover)
                    ? ""
                    : "faded")
                }
              />
            );
          })}
      </g>
    </g>
  );
}
export default MainPlot;
