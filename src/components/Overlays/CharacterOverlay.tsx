import { storyStore } from "../../stores/storyStore";
import { getColor, getLLMColor, textColorLLM } from "../../utils/colors";
import { character_offset, location_height } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";

import Image from "../Image";
import { onlyLetters } from "../../utils/helpers";

function CharacterOverlay() {
  const { characterHover, story, characterColor } = storyStore();
  const {
    characterScenes,
    character_quotes,
    sortedCharacters,
    character_data,
  } = dataStore();
  const {
    characterQuoteBoxes,
    characterQuoteTexts,
    colorQuoteBoxes,
    colorQuoteTexts,
  } = positionStore();
  return (
    <g id="character-quotes">
      {/* add box with quote from each character */}
      {characterScenes.map((character, i) => {
        const charColor = getColor(character.character, sortedCharacters);
        const llmColor =
          getLLMColor(character.character, sortedCharacters) || charColor;

        const explanation = character_data.find(
          (c) => c.character === character.character
        )?.explanation as string[];

        return (
          characterQuoteTexts[i] &&
          character_quotes[i] && (
            <g
              key={"character quotebox" + i}
              className={
                "character quote-box " +
                (characterHover !== character.character ? "" : "highlight")
              }
              fillOpacity={0}
              strokeOpacity={0}
            >
              <g>
                {characterQuoteBoxes[i] && (
                  <rect
                    x={characterQuoteBoxes[i].x}
                    y={characterQuoteBoxes[i].y}
                    width={characterQuoteBoxes[i].width}
                    height={characterQuoteBoxes[i].height}
                    fill="white"
                    strokeWidth={2}
                    stroke={characterColor === "llm" ? llmColor : charColor}
                    opacity={0.8}
                  />
                )}
                <text
                  x={characterQuoteTexts[i][0].x}
                  y={
                    characterQuoteTexts[i][0].y -
                    1.2 * character_offset +
                    +(characterQuoteTexts[i].length < 2
                      ? 0.5 * character_offset
                      : 0)
                  }
                  textAnchor="start"
                  className="quote-text"
                  fill={characterColor === "llm" ? llmColor : charColor}
                >
                  <tspan className="bold">{character.character}</tspan>{" "}
                  <tspan className="emphasis">
                    ({character_quotes[i].group})
                  </tspan>
                </text>

                {character_quotes[i].quote.map(
                  (quote, j) =>
                    characterQuoteTexts[i][j] && (
                      <text
                        key={"character quote" + i + j}
                        x={characterQuoteTexts[i][j].x}
                        y={
                          characterQuoteTexts[i][j].y +
                          (characterQuoteTexts[i].length < 2
                            ? 0.5 * character_offset
                            : 0)
                        }
                        textAnchor="start"
                        className="quote-text"
                      >
                        {quote}
                      </text>
                    )
                )}
              </g>
              <Image
                className="character-image"
                clipPath="inset(0% round 100%)"
                x={characterQuoteTexts[i][0].x - 0.6 * location_height}
                y={
                  characterQuoteTexts[i][0].y -
                  1.75 * character_offset +
                  (characterQuoteTexts[i].length <= 2
                    ? 0
                    : characterQuoteBoxes[i].height / 2 -
                      2.3 * character_offset)
                }
                width={location_height * 0.5}
                height={location_height * 0.5}
                href={
                  "/characters/" +
                  onlyLetters(story.replace("-mov", "")) +
                  "/" +
                  character_data.find(
                    (c) => c.character === character.character
                  )?.key +
                  ".png"
                }
                placeholder="/characters/placeholder.png"
              />
              {/* add color quotes */}
              {characterColor === "llm" && (
                <g className="color-quotes">
                  {colorQuoteBoxes[i] && (
                    <rect
                      x={colorQuoteBoxes[i].x}
                      y={colorQuoteBoxes[i].y}
                      width={colorQuoteBoxes[i].width}
                      height={colorQuoteBoxes[i].height}
                      fill={llmColor}
                      opacity={0.6}
                    />
                  )}
                  {explanation &&
                    explanation.map(
                      (quote, j) =>
                        colorQuoteTexts[i][j] && (
                          <text
                            key={"color quote" + i + j}
                            x={colorQuoteTexts[i][j].x}
                            y={colorQuoteTexts[i][j].y}
                            textAnchor="start"
                            className="quote-text color-quote"
                            fill={textColorLLM(llmColor)}
                          >
                            {quote}
                          </text>
                        )
                    )}
                </g>
              )}
            </g>
          )
        );
      })}
    </g>
  );
}
export default CharacterOverlay;
