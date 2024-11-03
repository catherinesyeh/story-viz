import { dataStore } from "../../stores/dataStore";

function Colorbar(props: any) {
  const { minLines, maxLines } = dataStore();

  const barType = props.barType;
  return (
    <div id="color-bars" className={barType === "default" ? "hidden" : ""}>
      <div className={"color-bar"}>
        <div className="inner-bar">
          <p className="number-label">
            {barType === "sentiment"
              ? "negative"
              : barType === "length"
              ? "short"
              : "low"}
            <span>
              {barType === "sentiment"
                ? -1
                : barType === "length"
                ? minLines
                : 0}
            </span>
          </p>
          <div className={"gradient " + barType} />
          <p className="number-label">
            {barType === "length"
              ? "long"
              : barType === "sentiment"
              ? "positive"
              : "high"}

            <span className="number-label">
              {barType === "length" ? maxLines : 1}
            </span>
          </p>
        </div>

        <span className="main-label">
          {barType === "length" ? "length (# lines)" : `${barType}`}
        </span>
      </div>
    </div>
  );
}

export default Colorbar;
