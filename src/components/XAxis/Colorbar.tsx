import { dataStore } from "../../stores/dataStore";

function Colorbar(props: any) {
  const { minLines, maxLines, sceneCharacters } = dataStore();

  const maxCharsInScene = Math.max(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );
  const minCharsInScene = Math.min(
    ...sceneCharacters.map((scene) => scene.characters.length)
  );

  const barType = props.barType;
  const fullWidth = props.fullWidth || false;
  return (
    <div id="color-bars" className={barType === "default" ? "hidden" : ""}>
      <div className={"color-bar " + (fullWidth ? "full-width" : "")}>
        <div className="inner-bar">
          <p className="number-label">
            {barType === "sentiment"
              ? "negative"
              : barType === "length"
              ? "short"
              : barType === "numChars"
              ? "few"
              : "low"}
            <span>
              {barType === "sentiment"
                ? -1
                : barType === "length"
                ? minLines
                : barType === "numChars"
                ? minCharsInScene
                : 0}
            </span>
          </p>
          <div className={"gradient " + barType} />
          <p className="number-label">
            {barType === "length"
              ? "long"
              : barType === "sentiment"
              ? "positive"
              : barType === "numChars"
              ? "many"
              : "high"}

            <span className="number-label">
              {barType === "length"
                ? maxLines
                : barType === "numChars"
                ? maxCharsInScene
                : 1}
            </span>
          </p>
        </div>

        <span className="main-label">
          {barType === "length"
            ? "length (# lines)"
            : barType === "numChars"
            ? "# characters"
            : `${barType}`}
        </span>
      </div>
    </div>
  );
}

export default Colorbar;
