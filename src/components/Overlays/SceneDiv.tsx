import { useEffect, useState } from "react";
import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";
import {
  conflictColor,
  emotionColor,
  getLLMColor,
  importanceColor,
  lengthColor,
  textColor,
} from "../../utils/colors";
import { chapterFormatted, normalize } from "../../utils/helpers";

function SceneDiv() {
  const { scene_data, minLines, maxLines, sceneSummaries, sortedCharacters } =
    dataStore();
  const { sceneHover } = storyStore();

  const scene = scene_data.find((scene) => scene.name === sceneHover);
  const scene_index = scene_data.findIndex(
    (scene) => scene.name === sceneHover
  );
  const numLines = scene ? scene.numLines : 0;
  const lengthVal = normalize(numLines, minLines, maxLines, 0, 1);
  const sceneSummary = sceneSummaries[scene_index];

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const buffer = 30;
  const maxRight = 650 + 2 * buffer;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // get max x position
      const max_x = window.innerWidth;

      // get window height
      const max_y = window.innerHeight;
      let curX = event.clientX;

      if (curX + maxRight > max_x) {
        curX = curX - maxRight;
      }

      let curY = event.clientY;
      let overlay = document.getElementById("scene-overlay");
      let overlayHeight = overlay ? overlay.clientHeight : 0;
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
  }, []);

  return (
    <div
      id="scene-overlay"
      className={sceneHover === "" ? "hidden" : ""}
      style={{
        left: mousePosition.x + buffer + "px", // Offset slightly from cursor
        top: mousePosition.y - buffer + "px",
      }}
    >
      <div id="scene-ratings">
        <div
          className="rating-box"
          style={{
            backgroundColor: lengthColor(lengthVal),
            color: textColor(lengthVal, false),
          }}
        >
          <b>Length: </b>
          {numLines} lines
        </div>
        {scene &&
          Object.keys(scene.ratings).map((rating) => {
            let rating_val = (scene.ratings as Record<string, number>)[rating];
            return (
              <div
                key={rating}
                className="rating-box"
                style={{
                  backgroundColor:
                    rating === "sentiment"
                      ? emotionColor(rating_val)
                      : rating === "conflict"
                      ? conflictColor(rating_val)
                      : importanceColor(rating_val),
                  color:
                    rating === "sentiment"
                      ? textColor(rating_val, true)
                      : textColor(rating_val, false),
                }}
              >
                <b>{rating}:</b>{" "}
                {rating_val !== undefined && rating_val.toFixed(2)}
              </div>
            );
          })}
      </div>

      {scene && (
        <div id="scene-info">
          <div id="scene-header">
            <b>
              Scene {scene.number}: {scene.name}
            </b>
            <b style={{ fontWeight: 600 }}>
              {chapterFormatted(scene.chapter)
                ? scene.chapter
                : "Chapter " + scene.chapter}
            </b>
          </div>
          <p>{scene.summary}</p>
          <p>
            <b style={{ fontWeight: 600 }}>Location:</b> {scene.location}
          </p>
        </div>
      )}

      <div id="scene-characters">
        <div id="scene-header">
          <b>Characters:</b>
        </div>
        {scene &&
          sceneSummary &&
          sceneSummary.emotions.map((char) => {
            const character = scene.characters.find(
              (c) => c.name === char.character
            ) as any;
            const emotion = character.emotion;
            const rating = character.rating;
            const llmColor = getLLMColor(char.character, sortedCharacters);
            return (
              <div key={char.character} className="character-info">
                <div className="char-header">
                  <b style={{ color: llmColor }}>
                    {char.character}{" "}
                    <span style={{ fontWeight: 500 }}>
                      (importance:{" "}
                      {
                        scene.characters.find((c) => c.name === char.character)
                          ?.importance_rank
                      }
                      )
                    </span>
                  </b>
                  <div className="emotion-box">
                    <b>{emotion}:</b>
                    <div
                      className="emotion-color"
                      style={{
                        backgroundColor: emotionColor(rating),
                        color: textColor(rating, true),
                      }}
                    >
                      {rating.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="char-quote">"{character.quote}"</div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default SceneDiv;
