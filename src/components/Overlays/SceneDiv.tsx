import { useEffect, useState } from "react";
import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";
import { emotionColor, getLLMColor, textColor } from "../../utils/colors";
import { chapterFormatted, normalize } from "../../utils/helpers";
import chroma from "chroma-js";

function SceneDiv() {
  const { scene_data, minLines, maxLines, sceneSummaries, sortedCharacters } =
    dataStore();
  const { sceneHover, chapterView, story } = storyStore();

  const scene = scene_data.find((scene) => scene.name === sceneHover);
  const scene_index = scene_data.findIndex(
    (scene) => scene.name === sceneHover
  );
  const numLines = scene ? scene.numLines : 0;
  const lengthVal = normalize(numLines, minLines, maxLines, 0, 1);
  const sceneSummary = sceneSummaries[scene_index];

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const buffer = 30;
  const maxCharsToShow = 18;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // get max x position
      const max_x = window.innerWidth;
      let curX = event.clientX;

      let overlay = document.getElementById("scene-overlay");
      let overlayHeight = overlay ? overlay.clientHeight : 0;

      const overlayWidth =
        scene && scene.characters && scene.characters.length > 8
          ? scene.characters.length > 16
            ? 850
            : 750
          : 650;
      const maxRight = overlayWidth + 2 * buffer;

      if (curX + maxRight > max_x) {
        curX = curX - maxRight;
      }

      // get window height
      const max_y = window.innerHeight;
      let curY = event.clientY;

      if (curY + overlayHeight + buffer > max_y) {
        curY = max_y - overlayHeight - buffer;
      }
      setMousePosition({ x: curX, y: curY });
    };

    // Add event listener to track mouse movement
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [scene]);

  return (
    <div
      id="scene-overlay"
      className={
        sceneHover === ""
          ? "hidden"
          : "" +
            (scene && scene.characters && scene.characters.length > 8
              ? scene.characters.length > 16
                ? " extra-wide"
                : " wide"
              : "")
      }
      style={{
        left: mousePosition.x + buffer + "px", // Offset slightly from cursor
        top: mousePosition.y - buffer + "px",
      }}
    >
      {scene && (
        <div id="scene-info">
          <div id="scene-header">
            <b>
              {chapterView
                ? chapterFormatted(scene.chapter)
                  ? scene.chapter
                  : "Chapter " + scene.chapter
                : `Scene ${scene.number}: ${scene.name}`}
            </b>
            {!chapterView && scene.chapter && (
              <b style={{ fontWeight: 600 }}>
                {chapterFormatted(scene.chapter)
                  ? scene.chapter
                  : "Chapter " + scene.chapter}
              </b>
            )}
            {chapterView && scene.numScenes && (
              <b style={{ fontWeight: 600 }}>
                {"Total Scenes: " + scene.numScenes}
              </b>
            )}
          </div>
          <p>{scene.summary}</p>
          <p>
            <b style={{ fontWeight: 600 }}>{chapterView && "Main "}Location:</b>{" "}
            {scene.location}{" "}
            {chapterView && scene.allLocations && (
              <span style={{ opacity: 0.7 }}>
                {"(" +
                  scene.allLocations[scene.location] +
                  (scene.allLocations[scene.location] > 1
                    ? " scenes)"
                    : " scene)")}
              </span>
            )}
          </p>
          {/* <b style={{ fontWeight: 600 }}>Ratings:</b> */}
          <div id="scene-ratings">
            {sceneHover !== "" && (
              <div className="rating-outer">
                <div className={"rating-colorbar"}>
                  <span className="min">{minLines}</span>
                  <div className={"bar "}>
                    <div
                      className="tip"
                      style={{ left: `${lengthVal * 100}%` }}
                    />
                  </div>
                  <span className="max">{maxLines}</span>
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

      {sceneHover !== "" && (
        <div id="scene-characters">
          <div id="scene-header">
            <b>
              {story.includes("-themes") ? "Themes" : "Characters"}:{" "}
              {scene && scene.characters && scene.characters.length}
              {scene &&
                scene.characters &&
                scene.characters.length > maxCharsToShow && (
                  <span>{" (top " + maxCharsToShow + " shown)"}</span>
                )}
            </b>
          </div>
          <div
            id="scene-char-inner"
            className={
              scene && scene.characters && scene.characters.length > 8
                ? scene.characters.length > 16
                  ? "two-col three-col"
                  : "two-col"
                : ""
            }
          >
            {scene &&
              sceneSummary &&
              sceneSummary.emotions.slice(0, maxCharsToShow).map((char) => {
                const character = scene.characters.find(
                  (c) => c.name === char.character
                ) as any;
                let emotion = character.emotion;
                // capitalize first letter
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
                const rating = character.rating as number;
                const llmColor = getLLMColor(char.character, sortedCharacters);
                // const top_scene = character.top_scene;
                return (
                  <div key={char.character} className="character-info">
                    <div className="char-header">
                      <b className="char-name">
                        <div
                          className="square"
                          style={{ backgroundColor: llmColor }}
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
                        <b>{emotion}:</b>
                        <div
                          className="emotion-color"
                          style={{
                            backgroundColor: chroma(emotionColor(rating)).css(),
                            color: textColor(rating, true),
                          }}
                        >
                          {rating.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="char-quote">
                      "{character.quote}"
                      {/* {chapterView && top_scene && " (Scene " + top_scene + ")"} */}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SceneDiv;
