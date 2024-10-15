import { dataStore } from "../../stores/dataStore";
import { color_dict } from "../../utils/colors";

function Colorbar() {
  const { minLines, maxLines } = dataStore();
  return (
    <div id="color-bars">
      {Object.keys(color_dict).map((scale) => (
        <div className={"color-bar"} key={"color legend " + scale}>
          <div className="inner-bar">
            <span className="number-label">
              {scale === "sentiment" ? -1 : scale === "length" ? minLines : 0}
            </span>
            <div className={"gradient " + scale} />
            <span className="number-label">
              {scale === "length" ? maxLines : 1}
            </span>
          </div>

          <span className="main-label">
            {scale === "length" ? "length (# lines)" : scale}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Colorbar;
