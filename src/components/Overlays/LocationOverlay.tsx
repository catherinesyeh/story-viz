import { storyStore } from "../../stores/storyStore";
import { character_offset } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";

function LocationOverlay() {
  const { locationHover } = storyStore();
  const { locations, location_quotes } = dataStore();
  const { locationQuoteBoxes, locationQuoteTexts } = positionStore();
  return (
    <g id="location-quotes">
      {/* add box with quote from each location */}
      {locations.map((location, i) => (
        <g
          key={"location quotebox" + i}
          className={
            "quote-box " + (locationHover !== location ? "" : "highlight")
          }
          fillOpacity={0}
          strokeOpacity={0}
        >
          {locationQuoteBoxes[i] && (
            <>
              <rect
                x={locationQuoteBoxes[i].x}
                y={locationQuoteBoxes[i].y}
                width={locationQuoteBoxes[i].width}
                height={locationQuoteBoxes[i].height}
                fill="white"
                strokeWidth={2}
                stroke="#eee"
                opacity={0.8}
              />
              <text
                x={locationQuoteTexts[i][0].x}
                y={locationQuoteTexts[i][0].y - 1.2 * character_offset}
                textAnchor="start"
                className="quote-text bold"
              >
                {location}
              </text>
            </>
          )}
          {locationQuoteTexts[i] &&
            location_quotes[i] &&
            location_quotes[i].quote.map(
              (quote, j) =>
                locationQuoteTexts[i][j] && (
                  <text
                    key={"location quote" + i + j}
                    x={locationQuoteTexts[i][j].x}
                    y={locationQuoteTexts[i][j].y}
                    textAnchor="start"
                    className="quote-text"
                  >
                    {quote}
                  </text>
                )
            )}
        </g>
      ))}
    </g>
  );
}
export default LocationOverlay;
