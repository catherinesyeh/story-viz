import { storyStore } from "../stores/storyStore";
import { color_dict, getColor } from "../utils/colors";
import {
  character_height,
  character_offset,
  extra_yshift,
} from "../utils/consts";
import { dataStore } from "../stores/dataStore";
import { positionStore } from "../stores/positionStore";

function Legend() {
  const { sortedCharacters } = dataStore();
  const {
    legendBoxPos,
    legendPos,
    colorBarPos,
    yShift,
    minConflictY,
    scenePos,
  } = positionStore();
  const {
    setCharacterHover,
    sceneHover,
    colorBy,
    hidden,
    characterColor: characterColorBy,
    setHidden,
    sizeBy,
    showConflict,
  } = storyStore();

  // Update array with list of hidden characters
  const updateHidden = (name: string) => {
    const newHidden = hidden.includes(name)
      ? hidden.filter((item: string) => item !== name)
      : [...hidden, name];
    setHidden(newHidden);
  };
  return (
    <g id="legends">
      {/* add legend */}
      <g id="legend">
        {/* draw legend box */}
        <rect
          x={legendBoxPos.x}
          y={legendBoxPos.y}
          width={legendBoxPos.width}
          height={legendBoxPos.height}
          fill="white"
          // fillOpacity={0}
          stroke="#eee"
          strokeWidth={2}
          opacity={0.8}
        />
        {sortedCharacters.map(
          (character, i) =>
            legendPos[i] && (
              <g
                key={"legendbox" + i}
                transform={`translate(${legendPos[i].x}, ${legendPos[i].y})`}
                className={
                  "legend-item " +
                  (hidden.includes(character.character) ? "faded" : "")
                }
                onClick={() => updateHidden(character.character)}
                onMouseEnter={() => setCharacterHover(character.character)}
                onMouseLeave={() => setCharacterHover("")}
              >
                <rect
                  x={0}
                  y={1}
                  width={character_height}
                  height={character_height}
                  fill={getColor(character.character, sortedCharacters)}
                />
                <text
                  x={character_offset}
                  y={character_height}
                  textAnchor="start"
                  className="legend-name"
                >
                  {character.short ? character.short : character.character}
                </text>
              </g>
            )
        )}
      </g>
      {/* add rectangular bar across bottom of plot to serve as legend */}
      <g
        id="color-legends"
        transform={
          "translate(0 " +
          (yShift + (showConflict ? extra_yshift(minConflictY, scenePos) : 0)) +
          ")"
        }
      >
        {Object.keys(color_dict).map((scale, i) => (
          <g
            className={
              "color-legend " +
              (sceneHover !== "" ||
              colorBy !== "default" ||
              characterColorBy !== "default"
                ? "highlight"
                : "")
            }
            key={"color legend bar" + scale}
            opacity={0}
          >
            <text
              x={colorBarPos[i].x - 0.75 * character_offset}
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y + character_height
                  : colorBarPos[i].y + character_height + 4 * character_offset
              }
              textAnchor="end"
              fill="black"
              className="legend-label"
            >
              {scale === "sentiment" ? -1 : 0}
            </text>
            <rect
              id="legend-bar"
              x={colorBarPos[i].x}
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y
                  : colorBarPos[i].y + 4 * character_offset
              }
              width={colorBarPos[i].width}
              height={colorBarPos[i].height}
              fill={"url(#legend" + scale + ")"}
            />
            <text
              x={colorBarPos[i].x + colorBarPos[i].width / 2}
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y + 2.4 * character_height
                  : colorBarPos[i].y +
                    2.4 * character_height +
                    4 * character_offset
              }
              textAnchor="middle"
            >
              {scale}
            </text>
            <text
              x={
                colorBarPos[i].x +
                colorBarPos[i].width +
                0.75 * character_offset
              }
              y={
                sizeBy === "default"
                  ? colorBarPos[i].y + character_height
                  : colorBarPos[i].y + character_height + 4 * character_offset
              }
              textAnchor="start"
              fill="black"
              className="legend-label"
            >
              1
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

export default Legend;
