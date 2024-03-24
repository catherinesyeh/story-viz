import { storyStore } from "../../store";
import {
  emotionColor,
  conflictColor,
  importanceColor,
  textColor,
  colors,
} from "../../utils/colors";
import { character_offset, character_height } from "../../utils/consts";
import {
  data as scene_data,
  sceneSummaries,
  characterScenes,
} from "../../utils/data";
import { normalizeRating, capitalize } from "../../utils/helpers";
import {
  scene_summary_boxes,
  scene_summary_texts,
} from "../../utils/positions";
function SceneOverlay() {
  const { sceneHover } = storyStore();
  return (
    <g id="scene-info">
      {/* add box with info about each scene */}
      {scene_data.map((scene, i) => (
        <g
          key={"scene info" + i}
          className={
            "scene-info-box " + (sceneHover !== scene.name ? "" : "highlight")
          }
          fillOpacity={0}
          strokeOpacity={0}
        >
          <rect
            x={scene_summary_boxes.x}
            y={scene_summary_boxes.y}
            width={scene_summary_boxes.width}
            height={scene_summary_texts[i].height}
            fill="white"
            strokeWidth={2}
            stroke="#eee"
            opacity={0.8}
            className="scene-info-inner"
          />
          <g>
            {Object.keys(scene.ratings).map((rating, j) => {
              let rating_val = (scene.ratings as Record<string, number>)[
                rating
              ];
              if (rating === "conflict") {
                rating_val = normalizeRating(rating_val);
              }
              return (
                <g key={"scene ratings for scene " + 0 + ": " + rating}>
                  <rect
                    x={
                      j % 3 === 0
                        ? scene_summary_texts[i].x
                        : j % 3 === 1
                        ? scene_summary_texts[i].x +
                          scene_summary_texts[i].third +
                          1.2 * character_offset
                        : scene_summary_texts[i].x +
                          2 * scene_summary_texts[i].third +
                          2.4 * character_offset
                    }
                    y={scene_summary_texts[i].y - character_offset}
                    width={scene_summary_texts[i].third}
                    height={character_offset * 1.8}
                    fill={
                      rating === "emotion"
                        ? emotionColor(rating_val)
                        : rating === "conflict"
                        ? conflictColor(rating_val)
                        : importanceColor(rating_val)
                    }
                  ></rect>
                  <text
                    x={
                      j % 3 === 0
                        ? scene_summary_texts[i].x +
                          0.5 * scene_summary_texts[i].third
                        : j % 3 === 1
                        ? scene_summary_texts[i].mid_x
                        : scene_summary_texts[i].end_x -
                          0.5 * scene_summary_texts[i].third
                    }
                    y={scene_summary_texts[i].y + 0.1 * character_offset}
                    textAnchor={"middle"}
                    className="scene-rating"
                    fill={
                      rating === "emotion"
                        ? textColor(rating_val, true)
                        : textColor(rating_val, false)
                    }
                  >
                    <tspan className="bold">{capitalize(rating)}:</tspan>{" "}
                    {rating_val.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>
          <text
            x={scene_summary_texts[i].x}
            y={scene_summary_texts[i].title_y}
            textAnchor="start"
            className="bold"
          >
            Scene {scene.number}: {scene.name}
          </text>
          {sceneSummaries[i].summary.map((summary, j) => (
            <text
              key={"scene summary" + i + j}
              x={scene_summary_texts[i].x}
              y={scene_summary_texts[i].summary_y + 1.2 * j * character_offset}
              textAnchor="start"
              className="quote-text scene"
            >
              {summary}
            </text>
          ))}
          <text
            x={scene_summary_texts[i].x}
            y={scene_summary_texts[i].location_y}
            textAnchor="start"
            className="scene-location"
            key={"scene location" + i}
          >
            <tspan className="bold">Location:</tspan> {scene.location.name}
          </text>
          {/* add divider line */}
          <line
            x1={scene_summary_texts[i].x}
            y1={scene_summary_texts[i].divider_y}
            x2={scene_summary_texts[i].end_x}
            y2={scene_summary_texts[i].divider_y}
            stroke="#eee"
            strokeWidth={1}
            key={"scene divider" + i}
          />
          {/* add characters in scene */}
          <g>
            <text
              x={scene_summary_texts[i].x}
              y={scene_summary_texts[i].character_y}
              className="bold"
            >
              Characters:
            </text>
            {sceneSummaries[i].emotions.map((char: any, j: number) => {
              const character = scene.characters.find(
                (c) => c.name === char.character
              ) as any;
              const emotion = character.emotions[0].emotion;
              const rating = character.emotions[0].rating;
              return (
                <g key={"scene character" + i + j}>
                  <text
                    x={scene_summary_texts[i].x}
                    y={
                      scene_summary_texts[i].character_list_y +
                      1.4 * j * character_offset +
                      scene_summary_texts[i].character_offsets[j]
                    }
                    textAnchor="start"
                    className="scene-character"
                    fill={
                      colors[
                        characterScenes.findIndex(
                          (c) => c.character === char.character
                        )
                      ]
                    }
                  >
                    <tspan className="bold">{char.character} </tspan>
                    <tspan className="emphasis">
                      (importance:{" "}
                      {scene.characters
                        .find((c) => c.name === char.character)
                        ?.importance.toFixed(2)}
                      )
                    </tspan>
                  </text>
                  <g>
                    <rect
                      x={scene_summary_texts[i].end_x - 4 * character_height}
                      y={
                        scene_summary_texts[i].character_list_y -
                        0.9 * character_offset +
                        1.4 * j * character_offset +
                        scene_summary_texts[i].character_offsets[j]
                      }
                      width={character_height * 4}
                      height={character_height * 1.8}
                      fill={emotionColor(rating)}
                    ></rect>
                    <text
                      x={scene_summary_texts[i].end_x - 2 * character_height}
                      y={
                        scene_summary_texts[i].character_list_y +
                        1.4 * j * character_offset +
                        scene_summary_texts[i].character_offsets[j]
                      }
                      textAnchor={"middle"}
                      className="scene-rating"
                      fill={textColor(rating, true)}
                    >
                      {rating.toFixed(2)}
                    </text>
                    <text
                      x={
                        scene_summary_texts[i].end_x -
                        4 * character_height -
                        character_offset
                      }
                      y={
                        scene_summary_texts[i].character_list_y +
                        1.4 * j * character_offset +
                        scene_summary_texts[i].character_offsets[j]
                      }
                      textAnchor={"end"}
                      className="scene-rating"
                    >
                      <tspan className="bold">{emotion}:</tspan>
                    </text>
                  </g>
                  <g>
                    {/* add quote from character */}
                    {char.emotion_quote.map((quote: any, l: number) => (
                      <text
                        key={"scene character quote" + i + j + l}
                        x={scene_summary_texts[i].x}
                        y={
                          scene_summary_texts[i].character_list_y +
                          1.4 * (j + 1) * character_offset +
                          1.2 * l * character_offset +
                          scene_summary_texts[i].character_offsets[j]
                        }
                        textAnchor="start"
                      >
                        {quote}
                      </text>
                    ))}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      ))}
    </g>
  );
}
export default SceneOverlay;
