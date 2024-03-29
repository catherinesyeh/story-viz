import { storyStore } from "../../stores/storyStore";
import { characterColor } from "../../utils/colors";
import { character_offset, location_height } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";

import Image from "../Image";

function CharacterOverlay() {
  const { characterHover, story } = storyStore();
  const { characterScenes, character_quotes } = dataStore();
  const { characterQuoteBoxes, characterQuoteTexts } = positionStore();
  return (
    <g id="character-quotes">
      {/* add box with quote from each character */}
      {characterScenes.map(
        (character, i) =>
          characterQuoteTexts[i] && (
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
                    stroke={characterColor(i / (characterScenes.length - 1))}
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
                  className="quote-text bold"
                  fill={characterColor(i / (characterScenes.length - 1))}
                >
                  {character.character}
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
                  2 * character_offset +
                  (characterQuoteTexts[i].length <= 2
                    ? 0
                    : characterQuoteBoxes[i].height / 2 -
                      2.5 * character_offset)
                }
                width={location_height * 0.5}
                height={location_height * 0.5}
                href={
                  "/characters/" +
                  story +
                  "/" +
                  character.character.split(" ")[0].toLowerCase() +
                  ".png"
                }
                placeholder="/characters/placeholder.png"
              />
            </g>
          )
      )}
    </g>
  );
}
export default CharacterOverlay;
