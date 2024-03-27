import { storyStore } from "../../stores/store";
import { character_offset } from "../../utils/consts";
import { dataStore } from "../../stores/dataStore";
import {
  location_quote_boxes,
  location_quote_texts,
} from "../../utils/positions";

function LocationOverlay() {
  const { locationHover } = storyStore();
  const { locations, location_quotes } = dataStore();
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
          <rect
            x={location_quote_boxes[i].x}
            y={location_quote_boxes[i].y}
            width={location_quote_boxes[i].width}
            height={location_quote_boxes[i].height}
            fill="white"
            strokeWidth={2}
            stroke="#eee"
            opacity={0.8}
          />
          <text
            x={location_quote_texts[i][0].x}
            y={location_quote_texts[i][0].y - 1.2 * character_offset}
            textAnchor="start"
            className="quote-text bold"
          >
            {location}
          </text>
          {location_quotes[i].quote.map((quote, j) => (
            <text
              key={"location quote" + i + j}
              x={location_quote_texts[i][j].x}
              y={location_quote_texts[i][j].y}
              textAnchor="start"
              className="quote-text"
            >
              {quote}
            </text>
          ))}
        </g>
      ))}
    </g>
  );
}
export default LocationOverlay;
