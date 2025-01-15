import chroma from "chroma-js";
import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";
import {
  emotionColor,
  getColor,
  getGroupColor,
  getLLMColor,
  importanceColor,
} from "../../utils/colors";
import { chapterFormatted, normalize } from "../../utils/helpers";
import CharacterNetwork from "../Vis/CharacterNetwork";
import LocationChart from "../Vis/LocationChart";
import { Button, Select, Switch } from "@mantine/core";
import ChapterText from "./ChapterText";

function SceneDivInner(props: any) {
  const {
    scene_data,
    sceneSummaries,
    sortedCharacters,
    chapter_data,
    chapterMin,
    chapterMax,
    sceneMin,
    sceneMax,
  } = dataStore();
  const {
    sceneHover,
    chapterView,
    themeView,
    characterColor,
    detailView,
    chapterHover,
    showChapterText,
    setShowChapterText,
    curScrollScene,
    setCurScrollScene,
    setScrollSource,
    cumulativeMode,
    setCumulativeMode,
  } = storyStore();

  let scene;
  const inSidebar = props.inSidebar || false;

  if (
    inSidebar &&
    detailView &&
    (!chapterView || sceneHover === "") &&
    chapterHover !== ""
  ) {
    scene = chapter_data.find((scene) => scene.name === chapterHover);
  } else {
    scene = scene_data.find((scene) => scene.name === sceneHover);
  }
  const scene_index = scene_data.findIndex(
    (scene) => scene.name === sceneHover
  );
  const numLines = scene ? scene.numLines : 0;
  let min_lines = sceneMin;
  let max_lines = sceneMax;
  if (
    chapterView ||
    (inSidebar &&
      detailView &&
      (!chapterView || sceneHover === "") &&
      chapterHover !== "")
  ) {
    min_lines = chapterMin;
    max_lines = chapterMax;
  }

  const lengthVal = normalize(numLines, min_lines, max_lines, 0, 1);
  const sceneSummary = sceneSummaries[scene_index];

  const maxCharsToShow = 16;

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  const sceneList = scene_data
    .filter((scene) => scene.chapter === chapterHover)
    .map((scene) => scene.name);

  return (
    <>
      {(scene || detailView) && (
        <div
          id="scene-info"
          className={
            detailView && sceneHover === "" && chapterHover === ""
              ? "transparent"
              : ""
          }
        >
          <div id="scene-header">
            {scene && scene.chapter && (
              <b>
                {chapterView || inSidebar
                  ? chapterFormatted(scene.chapter)
                    ? scene.chapter
                    : "Chapter " + scene.chapter
                  : `Scene ${scene.number}: ${scene.name}`}
              </b>
            )}
            {scene && !chapterView && !inSidebar && scene.chapter && (
              <b style={{ fontWeight: 600 }}>
                {chapterFormatted(scene.chapter)
                  ? scene.chapter
                  : "Chapter " + scene.chapter}
              </b>
            )}
            {(chapterView || inSidebar) && scene && scene.numScenes && (
              <b style={{ fontWeight: 600 }}>
                {"Total Scenes: " + scene.numScenes}
              </b>
            )}
            {detailView &&
              inSidebar &&
              sceneHover === "" &&
              chapterHover === "" && (
                <p>Hover on a chapter to see more details! Click to lock it.</p>
              )}
          </div>
          <p>{scene && scene.summary}</p>
          {!chapterView && !inSidebar && (
            <p>
              <b style={{ fontWeight: 600 }}>
                {chapterView && "Main "}Location:
              </b>{" "}
              {scene && scene.location}{" "}
              {chapterView && scene && scene.allLocations && (
                <span style={{ opacity: 0.7 }}>
                  {"(" +
                    scene.allLocations[scene.location] +
                    (scene.allLocations[scene.location] > 1
                      ? " scenes)"
                      : " scene)")}
                </span>
              )}
            </p>
          )}
          {/* <b style={{ fontWeight: 600 }}>Ratings:</b> */}
          <div id="scene-ratings">
            {(chapterHover !== "" || sceneHover !== "") && (
              <div className="rating-outer">
                <div className={"rating-colorbar"}>
                  <span className="min">{min_lines}</span>
                  <div className={"bar "}>
                    <div
                      className="tip"
                      style={{ left: `${lengthVal * 100}%` }}
                    />
                  </div>
                  <span className="max">{max_lines}</span>
                </div>
                <div
                  className="rating-box"
                  style={
                    {
                      // backgroundColor: lengthColor(lengthVal),
                      // color: textColor(lengthVal, false),
                    }
                  }
                >
                  <b>length: </b>
                  {lengthVal < 0.4
                    ? "short"
                    : lengthVal > 0.6
                    ? "long"
                    : "med"}{" "}
                  <span style={{ opacity: 0.7 }}>({numLines} lines)</span>
                </div>
              </div>
            )}
            {scene &&
              scene.ratings &&
              Object.keys(scene.ratings).map((rating) => {
                const rating_val = (scene.ratings as Record<string, number>)[
                  rating
                ];
                // convert to normalized percent
                const rating_val_norm =
                  rating === "sentiment"
                    ? normalize(rating_val, -1, 1, 0, 1)
                    : rating_val;

                return (
                  <div key={rating} className="rating-outer">
                    <div className={"rating-colorbar "}>
                      <span className="min">
                        {rating === "sentiment" ? -1 : 0}
                      </span>
                      <div className={"bar " + rating}>
                        <div
                          className="tip"
                          style={{ left: `${rating_val_norm * 100}%` }}
                        />
                      </div>
                      <span className="max">{1}</span>
                    </div>
                    <div
                      className="rating-box"
                      style={
                        {
                          // backgroundColor:
                          //   rating === "sentiment"
                          //     ? emotionColor(rating_val)
                          //     : rating === "conflict"
                          //     ? conflictColor(rating_val)
                          //     : importanceColor(rating_val),
                          // color:
                          //   rating === "sentiment"
                          //     ? textColor(rating_val, true)
                          //     : textColor(rating_val, false),
                        }
                      }
                    >
                      <b>{rating}:</b>{" "}
                      {rating === "sentiment"
                        ? rating_val < -0.2
                          ? "neg"
                          : rating_val > 0.2
                          ? "pos"
                          : "neutral"
                        : rating_val < 0.4
                        ? "low"
                        : rating_val > 0.6
                        ? "high"
                        : "med"}{" "}
                      <span style={{ opacity: 0.7 }}>
                        ({rating_val !== undefined && rating_val.toFixed(2)})
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {detailView && inSidebar && scene && (
        <div className="text-header">
          <Button.Group className="scene-toggle-buttons">
            <Button
              variant="default"
              size="xs"
              className={!showChapterText ? "active" : ""}
              onClick={() => setShowChapterText(false)}
            >
              {themeView ? "Themes" : "Characters"} / Location Info
            </Button>
            <Button
              variant="default"
              size="xs"
              className={showChapterText ? "active" : ""}
              onClick={() => setShowChapterText(true)}
            >
              Chapter Text
            </Button>
          </Button.Group>
          <div className={"scene-select " + (showChapterText ? "hidden" : "")}>
            <b>Cumulative mode</b>
            <Switch
              size="xs"
              checked={cumulativeMode}
              onChange={(event) =>
                setCumulativeMode(event.currentTarget.checked)
              }
            />
          </div>
          <div className={"scene-select " + (!showChapterText ? "hidden" : "")}>
            <b>Scroll to</b>
            <Select
              size="xs"
              data={sceneList}
              value={curScrollScene}
              onChange={(value) => {
                if (value) {
                  setScrollSource(true); // Mark scroll as programmatic
                  setCurScrollScene(value);
                }
              }}
            />
          </div>
        </div>
      )}

      {(chapterHover !== "" || sceneHover !== "") && (
        <div id="scene-characters">
          <div
            id="scene-header"
            className={
              !showChapterText && (chapterView || inSidebar) ? "split" : ""
            }
          >
            {(!showChapterText || !inSidebar) && (
              <div className="character-header">
                <b>
                  {themeView ? "Themes" : "Characters"}:{" "}
                  {scene && scene.characters && scene.characters.length}
                  {scene &&
                    scene.characters &&
                    scene.characters.length > maxCharsToShow &&
                    !chapterView && (
                      <span>{" (top " + maxCharsToShow + " shown)"}</span>
                    )}
                </b>
                {(chapterView || inSidebar) && (
                  <span className="key-text">
                    circle size = importance, line thickness = # of mutual
                    scenes
                  </span>
                )}
              </div>
            )}
            {!cumulativeMode &&
              (chapterView || inSidebar) &&
              (!showChapterText || !inSidebar) && (
                <b>
                  Locations:{" "}
                  {scene &&
                    scene.allLocations &&
                    Object.keys(scene.allLocations).length}
                </b>
              )}
          </div>
          <div
            id="scene-char-inner"
            className={
              !cumulativeMode && (chapterView || inSidebar)
                ? "split"
                : !cumulativeMode &&
                  scene &&
                  scene.characters &&
                  scene.characters.length > 8
                ? "two-col"
                : ""
            }
          >
            {scene && !chapterView && !inSidebar && sceneSummary ? (
              sceneSummary.emotions.slice(0, maxCharsToShow).map((char) => {
                const character = scene.characters.find(
                  (c) => c.name === char.character
                ) as any;
                let emotion = character.emotion;
                // capitalize first letter
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
                const rating = character.rating as number;
                const rating_val_norm = normalize(rating, -1, 1, 0, 1);
                const importance = character.importance as number;
                const group = sortedCharacters.find(
                  (c) => c.character === char.character
                )?.group;

                const charColor = getColor(char.character, sortedCharacters);
                const llmColor =
                  getLLMColor(char.character, sortedCharacters) || charColor;
                const groupColor = group
                  ? getGroupColor(group, uniqueGroups)
                  : charColor;
                const sent_color = chroma(emotionColor(rating)).css();
                const imp_color = chroma(importanceColor(importance)).css();

                // const top_scene = character.top_scene;
                return (
                  <div key={char.character} className="character-info">
                    <div className="char-header">
                      <b className="char-name">
                        <div
                          className="square"
                          style={{
                            backgroundColor:
                              characterColor === "llm"
                                ? llmColor
                                : characterColor === "group"
                                ? groupColor
                                : characterColor === "sentiment"
                                ? sent_color
                                : characterColor === "importance"
                                ? imp_color
                                : charColor,
                          }}
                        />
                        <div>
                          {char.character}{" "}
                          <span
                            style={{
                              fontWeight: 400,
                              opacity: 0.7,
                              fontFamily: "var(--mantine-font-family)",
                            }}
                          >
                            (importance: {character.importance_rank}
                            {character.numScenes
                              ? ", scenes: " + character.numScenes
                              : ""}
                            )
                          </span>
                        </div>
                      </b>
                      <div className="emotion-box">
                        <b>
                          {emotion}
                          {/* {" "} */}
                          {/* {rating < -0.2 ? "🙁" : rating > 0.2 ? "🙂" : "😐"} */}
                        </b>
                        {/* <div
                          className="emotion-color"
                          style={{
                            backgroundColor: chroma(emotionColor(rating)).css(),
                            color: textColor(rating, true),
                          }}
                        >
                          {rating.toFixed(2)}
                        </div> */}
                        <div className="rating-outer">
                          <div className={"rating-colorbar mini"}>
                            <span className="min">{-1}</span>
                            <div className={"bar sentiment "}>
                              <div
                                className="tip"
                                style={{ left: `${rating_val_norm * 100}%` }}
                              />
                              {/* <span className="rating">
                                {rating.toFixed(2)}
                              </span> */}
                            </div>
                            <span className="max">{1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="char-quote">
                      "{character.quote}"
                      {/* {chapterView && top_scene && " (Scene " + top_scene + ")"} */}
                    </div>
                  </div>
                );
              })
            ) : showChapterText && inSidebar ? (
              <ChapterText />
            ) : (
              <>
                <div>
                  <CharacterNetwork inSidebar={inSidebar} />
                </div>
                {!cumulativeMode && <LocationChart inSidebar={inSidebar} />}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SceneDivInner;
