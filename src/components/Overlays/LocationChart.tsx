import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";

function LocationChart() {
  const { scene_data, location_data } = dataStore();
  const { sceneHover } = storyStore();

  const scene = scene_data.find((scene) => scene.name === sceneHover);
  const locationDict = scene?.allLocations || {};

  const maxCount = Math.max(...Object.values(locationDict), 0); // Find the maximum count for scaling

  // Chart dimensions and styles
  const barHeight = 12; // Height of each bar
  const barGap = 2; // Gap between bars
  const fontSize = 9; // Font size for labels
  const maxCharsToShow = 26; // Maximum number of characters to show in a label

  const chartStyle: React.CSSProperties = {
    width: "100%", // Take up full width
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    transition: "0.5s",
  };

  const barContainerStyle = {
    marginBottom: `${barGap}px`,
    width: "100%", // Ensure the container spans 100% width
    transition: "0.5s",
  };

  const barStyle = (count: number) => ({
    width: `${(count / maxCount) * 100}%`, // Scale width dynamically as a percentage
    height: `${barHeight}px`,
    backgroundColor: "#000",
    transition: "0.5s",
    display: "flex",
    paddingLeft: "2px",
    alignItems: "center",
  });

  const labelStyle = {
    fontSize: `${fontSize}px`,
    marginBottom: "0px",
    transition: "0.5s",
  };

  return (
    <div style={chartStyle}>
      {Object.entries(locationDict).map(([location, count]) => (
        <div key={location} style={barContainerStyle}>
          {/* Label above the bar */}
          <div style={labelStyle}>
            {(() => {
              const emoji = location_data.find(
                (d) => d.name === location
              )?.emoji;
              return emoji ? emoji + " " : "";
            })()}
            {location.length > maxCharsToShow
              ? location.slice(0, maxCharsToShow) + "..."
              : location}
          </div>
          {/* Bar */}
          <div style={barStyle(count)}>
            <div
              style={{
                color: "white",
                fontSize: fontSize - 1,
                fontWeight: 600,
              }}
            >
              {count}
            </div>
          </div>
        </div>
      ))}
      {/* X-Axis */}
      <div
        style={{
          marginTop: `${barGap}px`,
          width: "100%", // Take up full width
          borderWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "rgb(0,0,0, 0.7)",
          opacity: 0.7,
          display: "flex",
          justifyContent: "space-between",
          fontSize: `${fontSize}px`,
        }}
      >
        <div>0</div>
        <div style={{ fontWeight: 500 }}># scenes</div>
        <div>{maxCount}</div>
      </div>
    </div>
  );
}

export default LocationChart;
