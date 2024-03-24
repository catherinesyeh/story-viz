import { storyStore } from "../store";
import { colors, color_dict } from "../utils/colors";
import { character_height, character_offset } from "../utils/consts";
import { reverseCharacterNames } from "../utils/data";
import { legend_box_pos, legendPos, color_bar_pos } from "../utils/positions";

function Legend() {
  const {
    setCharacterHover,
    sceneHover,
    showConflict,
    showCharacterEmotions,
    hidden,
    setHidden,
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
          x={legend_box_pos.x}
          y={legend_box_pos.y}
          width={legend_box_pos.width}
          height={legend_box_pos.height}
          fill="white"
          // fillOpacity={0}
          stroke="#eee"
          strokeWidth={2}
          opacity={0.8}
        />
        {reverseCharacterNames.map((character, i) => (
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
              y={0}
              width={character_height}
              height={character_height}
              fill={colors[reverseCharacterNames.length - 1 - i]}
            />
            <text
              x={character_offset}
              y={character_height}
              textAnchor="start"
              className="legend-name"
            >
              {character.character}
            </text>
          </g>
        ))}
        <text
          x={legend_box_pos.x + legend_box_pos.width}
          y={legend_box_pos.y + legend_box_pos.height + 2 * character_height}
          textAnchor="end"
          className="legend-title italic emphasis"
        >
          Square size = character importance
        </text>
      </g>
      {/* add rectangular bar across bottom of plot to serve as legend */}
      <g id="color-legends">
        {Object.keys(color_dict).map((scale, i) => (
          <g
            className={
              "color-legend " +
              (sceneHover !== "" || showConflict || showCharacterEmotions
                ? "highlight"
                : "")
            }
            key={"color legend bar" + scale}
            opacity={0}
          >
            <text
              x={color_bar_pos[i].x - 0.75 * character_offset}
              y={color_bar_pos[i].y + character_height}
              textAnchor="end"
              fill="black"
              className="legend-label"
            >
              {scale === "emotion" ? -1 : 0}
            </text>
            <rect
              id="legend-bar"
              x={color_bar_pos[i].x}
              y={color_bar_pos[i].y}
              width={color_bar_pos[i].width}
              height={color_bar_pos[i].height}
              fill={"url(#legend" + scale + ")"}
            />
            <text
              x={color_bar_pos[i].x + color_bar_pos[i].width / 2}
              y={color_bar_pos[i].y + 2.4 * character_height}
              textAnchor="middle"
            >
              {scale}
            </text>
            <text
              x={
                color_bar_pos[i].x +
                color_bar_pos[i].width +
                0.75 * character_offset
              }
              y={color_bar_pos[i].y + character_height}
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
