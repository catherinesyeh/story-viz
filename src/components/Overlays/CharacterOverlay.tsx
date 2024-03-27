import { storyStore } from "../../stores/store";
import { colors } from "../../utils/colors";
import { character_offset, location_height } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import {
  character_quote_boxes,
  character_quote_texts,
} from "../../utils/positions";

function CharacterOverlay() {
  const { characterHover } = storyStore();
  const { characterScenes, character_quotes } = dataStore();
  return (
    <g id="character-quotes">
      {/* add box with quote from each character */}
      {characterScenes.map((character, i) => (
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
            <rect
              x={character_quote_boxes[i].x}
              y={character_quote_boxes[i].y}
              width={character_quote_boxes[i].width}
              height={character_quote_boxes[i].height}
              fill="white"
              strokeWidth={2}
              stroke={colors[i]}
              opacity={0.8}
            />
            <text
              x={character_quote_texts[i][0].x}
              y={
                character_quote_texts[i][0].y -
                1.2 * character_offset +
                +(character_quote_texts[i].length < 2
                  ? 0.5 * character_offset
                  : 0)
              }
              textAnchor="start"
              className="quote-text bold"
              fill={colors[i]}
            >
              {character.character}
            </text>
            {character_quotes[i].quote.map((quote, j) => (
              <text
                key={"character quote" + i + j}
                x={character_quote_texts[i][j].x}
                y={
                  character_quote_texts[i][j].y +
                  (character_quote_texts[i].length < 2
                    ? 0.5 * character_offset
                    : 0)
                }
                textAnchor="start"
                className="quote-text"
              >
                {quote}
              </text>
            ))}
          </g>
          <image
            className="character-image"
            x={character_quote_texts[i][0].x - 0.6 * location_height}
            y={
              character_quote_texts[i][0].y -
              2 * character_offset +
              (character_quote_texts[i].length <= 2
                ? 0
                : character_quote_boxes[i].height / 2 - 2.5 * character_offset)
            }
            width={location_height * 0.5}
            height={location_height * 0.5}
            href={
              "/characters/" +
              character.character.split(" ")[0].toLowerCase() +
              ".png"
            }
          />
        </g>
      ))}
    </g>
  );
}
export default CharacterOverlay;
