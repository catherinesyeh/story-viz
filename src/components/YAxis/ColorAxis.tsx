import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import { location_height } from "../../utils/consts";

function ColorAxis() {
  const { sceneCharacters, customYAxisOptions } = dataStore();
  const { plotHeight } = positionStore();
  const { yAxis, yAxisHeight, fullHeight, story, chapterView, themeView } =
    storyStore();

  const max_characters_per_scene = Math.max(
    ...sceneCharacters.map((char) => char.characters.length)
  );
  const min_characters_per_scene = Math.min(
    ...sceneCharacters.map((char) => char.characters.length)
  );

  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;

  const margin = yAxis === "importance" || yAxis.includes("#") ? 1.6 : 1.5;

  return (
    <div id="color-axis-outer">
      <p style={{ width: "max-content" }}>
        {yAxis.includes("stacked")
          ? themeView
            ? "themes"
            : "character"
          : yAxis}
      </p>
      <div
        id="color-axis"
        className={
          yAxis.includes("stacked")
            ? "hidden"
            : yAxis.includes("#")
            ? "numChars"
            : customYAxisOptions.includes(yAxis)
            ? "custom"
            : yAxis
        }
        style={{
          marginLeft:
            story.includes("-new") && !fullHeight && !chapterView
              ? Math.min(margin * ratio, margin) + "rem"
              : margin + "rem",
          width:
            story.includes("-new") && !fullHeight && !chapterView
              ? Math.min(ratio, 1) + "rem"
              : "1rem",
        }}
      >
        <span
          style={{
            color: yAxis.includes("#") ? "black" : "white",
            marginBottom: "-1rem",
          }}
        >
          {yAxis.includes("#") ? min_characters_per_scene : 1}
        </span>
        <span
          style={{
            color:
              yAxis === "importance" || customYAxisOptions.includes(yAxis)
                ? "black"
                : "white",
            marginBottom: "-1rem",
          }}
        >
          {yAxis === "sentiment" ? -1 : max_characters_per_scene}
        </span>
      </div>
    </div>
  );
}

export default ColorAxis;
