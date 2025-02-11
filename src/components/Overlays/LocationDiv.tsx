import { useEffect, useState } from "react";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { location_height } from "../../utils/consts";

function LocationDiv() {
  const {
    locationHover,
    yAxisHeight,
    yAxis,
    story,
    fullHeight,
    chapterView,
    storyMarginTop,
  } = storyStore();
  const { location_quotes } = dataStore();
  const { plotHeight } = positionStore();
  const [locationName, setLocationName] = useState("");
  const [locationQuote, setLocationQuote] = useState("");
  const [locationEmoji, setLocationEmoji] = useState("");

  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;

  useEffect(() => {
    if (locationHover !== "") {
      const loc = location_quotes.find((l) => l.location === locationHover);
      if (loc) {
        setLocationName(loc.location);
        const quote = Array.isArray(loc.quote)
          ? loc.quote.join(" ").trim()
          : loc.quote;
        setLocationQuote(quote);
        if (loc.emoji) {
          setLocationEmoji(loc.emoji);
        } else {
          setLocationEmoji("");
        }
      }
    }
  }, [locationHover]);
  return (
    <div
      id="location-overlay"
      className={yAxis == "location" && locationHover !== "" ? "" : "hidden"}
      style={{
        left:
          story.includes("-new") &&
          !fullHeight &&
          !chapterView &&
          (yAxis === "location" || yAxis === "character")
            ? "calc(" + 160 * ratio + "px + 2rem)"
            : "calc(160px + 2rem)",
        top: storyMarginTop,
      }}
    >
      <b>
        {locationName || "Location"}{" "}
        {locationEmoji && locationEmoji !== "" && locationEmoji}
      </b>
      <p>{locationQuote || "Quote"}</p>
    </div>
  );
}

export default LocationDiv;
