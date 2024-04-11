import { storyStore } from "../../stores/storyStore";
import {
  emotionColor,
  conflictColor,
  importanceColor,
  textColor,
  getColor,
  getLLMColor,
} from "../../utils/colors";
import { character_offset, character_height } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import { capitalize } from "../../utils/helpers";
import { positionStore } from "../../stores/positionStore";

function SceneOverlay() {
  const { sceneHover, characterColor } = storyStore();
  const { scene_data, sceneSummaries, sortedCharacters } = dataStore();
  const { sceneSummaryBoxes, sceneSummaryTexts } = positionStore();

  return (
    <g id="scene-info">
      {/* add box with info about each scene */}
      {scene_data.map(
        (scene, i) =>
          sceneSummaryTexts[i] && (
            <g
              key={"scene info" + i}
              className={
                "scene-info-box " +
                (sceneHover !== scene.name ? "" : "highlight")
              }
              fillOpacity={0}
              strokeOpacity={0}
            >
              <rect
                x={sceneSummaryBoxes[i].x}
                y={sceneSummaryBoxes[i].y}
                width={sceneSummaryBoxes[i].width}
                height={sceneSummaryTexts[i].height}
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
                  return (
                    <g key={"scene ratings for scene " + 0 + ": " + rating}>
                      <rect
                        x={
                          j % 3 === 0
                            ? sceneSummaryTexts[i].x
                            : j % 3 === 1
                            ? sceneSummaryTexts[i].x +
                              sceneSummaryTexts[i].third +
                              1.2 * character_offset
                            : sceneSummaryTexts[i].x +
                              2 * sceneSummaryTexts[i].third +
                              2.4 * character_offset
                        }
                        y={sceneSummaryTexts[i].y - character_offset}
                        width={sceneSummaryTexts[i].third}
                        height={character_offset * 1.8}
                        fill={
                          rating === "sentiment"
                            ? emotionColor(rating_val)
                            : rating === "conflict"
                            ? conflictColor(rating_val)
                            : importanceColor(rating_val)
                        }
                      ></rect>
                      <text
                        x={
                          j % 3 === 0
                            ? sceneSummaryTexts[i].x +
                              0.5 * sceneSummaryTexts[i].third
                            : j % 3 === 1
                            ? sceneSummaryTexts[i].mid_x
                            : sceneSummaryTexts[i].end_x -
                              0.5 * sceneSummaryTexts[i].third
                        }
                        y={sceneSummaryTexts[i].y + 0.1 * character_offset}
                        textAnchor={"middle"}
                        className="scene-rating"
                        fill={
                          rating === "sentiment"
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
                x={sceneSummaryTexts[i].x}
                y={sceneSummaryTexts[i].title_y}
                textAnchor="start"
                className="bold"
              >
                Scene {scene.number}: {scene.name}
              </text>
              {sceneSummaries[i].summary.map((summary, j) => (
                <text
                  key={"scene summary" + i + j}
                  x={sceneSummaryTexts[i].x}
                  y={
                    sceneSummaryTexts[i].summary_y + 1.2 * j * character_offset
                  }
                  textAnchor="start"
                  className="quote-text scene"
                >
                  {summary}
                </text>
              ))}
              <text
                x={sceneSummaryTexts[i].x}
                y={sceneSummaryTexts[i].location_y}
                textAnchor="start"
                className="scene-location"
                key={"scene location" + i}
              >
                <tspan className="bold">Location:</tspan> {scene.location}
              </text>
              {/* add divider line */}
              <line
                x1={sceneSummaryTexts[i].x}
                y1={sceneSummaryTexts[i].divider_y}
                x2={sceneSummaryTexts[i].end_x}
                y2={sceneSummaryTexts[i].divider_y}
                stroke="#eee"
                strokeWidth={1}
                key={"scene divider" + i}
              />
              {/* add characters in scene */}
              <g>
                <text
                  x={sceneSummaryTexts[i].x}
                  y={sceneSummaryTexts[i].character_y}
                  className="bold"
                >
                  Characters:
                </text>
                {sceneSummaries[i].emotions.map((char, j) => {
                  const character = scene.characters.find(
                    (c) => c.name === char.character
                  ) as any;
                  const emotion = character.emotion;
                  const rating = character.rating;
                  const llmColor = getLLMColor(
                    char.character,
                    sortedCharacters
                  );
                  return (
                    <g key={"scene character" + i + j}>
                      <text
                        x={sceneSummaryTexts[i].x}
                        y={
                          sceneSummaryTexts[i].character_list_y +
                            1.4 * j * character_offset +
                            sceneSummaryTexts[i].character_offsets[j] || 0
                        }
                        textAnchor="start"
                        className="scene-character"
                        fill={
                          characterColor === "llm" && llmColor
                            ? llmColor
                            : getColor(char.character, sortedCharacters)
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
                          x={sceneSummaryTexts[i].end_x - 4 * character_height}
                          y={
                            sceneSummaryTexts[i].character_list_y -
                              0.9 * character_offset +
                              1.4 * j * character_offset +
                              sceneSummaryTexts[i].character_offsets[j] || 0
                          }
                          width={character_height * 4}
                          height={character_height * 1.8}
                          fill={emotionColor(rating)}
                        ></rect>
                        <text
                          x={sceneSummaryTexts[i].end_x - 2 * character_height}
                          y={
                            sceneSummaryTexts[i].character_list_y +
                              1.4 * j * character_offset +
                              sceneSummaryTexts[i].character_offsets[j] || 0
                          }
                          textAnchor={"middle"}
                          className="scene-rating"
                          fill={textColor(rating, true)}
                        >
                          {rating.toFixed(2)}
                        </text>
                        <text
                          x={
                            sceneSummaryTexts[i].end_x -
                            4 * character_height -
                            character_offset
                          }
                          y={
                            sceneSummaryTexts[i].character_list_y +
                              1.4 * j * character_offset +
                              sceneSummaryTexts[i].character_offsets[j] || 0
                          }
                          textAnchor={"end"}
                          className="scene-rating"
                        >
                          <tspan className="bold">{emotion}:</tspan>
                        </text>
                      </g>
                      <g>
                        {/* add quote from character */}
                        {char.emotion_quote.map((quote, l) => (
                          <text
                            key={"scene character quote" + i + j + l}
                            x={sceneSummaryTexts[i].x}
                            y={
                              sceneSummaryTexts[i].character_list_y +
                                1.4 * (j + 1) * character_offset +
                                1.2 * l * character_offset +
                                sceneSummaryTexts[i].character_offsets[j] || 0
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
          )
      )}
    </g>
  );
}
export default SceneOverlay;
