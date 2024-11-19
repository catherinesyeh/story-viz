import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";

function ColorAxis() {
  const { sceneCharacters } = dataStore();
  const { plotHeight } = positionStore();
  const { yAxis, yAxisHeight, fullHeight, story, chapterView, themeView } =
    storyStore();
  const max_characters_per_scene = Math.max(
    ...sceneCharacters.map((char) => char.characters.length)
  );

  const ratio = yAxisHeight / plotHeight;

  const margin = yAxis === "importance" ? 1.6 : 1.5;

  return (
    <div id="color-axis-outer">
      <p>
        {yAxis.includes("stacked")
          ? themeView
            ? "themes"
            : "character"
          : yAxis}
      </p>
      <div
        id="color-axis"
        className={yAxis.includes("stacked") ? "hidden" : yAxis}
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
        <span>1</span>
        <span
          style={{
            color: yAxis === "importance" ? "black" : "white",
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
