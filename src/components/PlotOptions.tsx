import { Switch, Select, Divider } from "@mantine/core";
import { storyStore } from "../store";

function PlotOptions() {
  const {
    characterColor,
    setCharacterColor,
    showConflict,
    setShowConflict,
    colorBy,
    setColorBy,
    sizeBy,
    setSizeBy,
  } = storyStore();
  const colorByOptions = ["conflict", "emotion", "importance", "default"];
  const characterColorOptions = ["default", "emotion", "importance"];
  const sizeByOptions = ["conflict", "importance", "default"];
  return (
    <div id="options">
      <div className="options-contain">
        <b>Conflict Overlay</b>
        <div className="options-inner">
          <Switch
            size="xs"
            label="Show"
            labelPosition="left"
            checked={showConflict}
            onChange={(event) => setShowConflict(event.currentTarget.checked)}
          />
          <Select
            disabled={!showConflict}
            size="xs"
            label="Color by"
            data={colorByOptions}
            value={colorBy}
            onChange={(value) => {
              if (value) setColorBy(value);
            }}
          />
        </div>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <b>Scene Names</b>
        <div className="options-inner">
          <Select
            size="xs"
            label="Size by"
            data={sizeByOptions}
            value={sizeBy}
            onChange={(value) => {
              if (value) setSizeBy(value);
            }}
          />
          <Select
            size="xs"
            label="Color by"
            data={colorByOptions}
            value={colorBy}
            onChange={(value) => {
              if (value) setColorBy(value);
            }}
          />
        </div>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <b>Character Squares</b>
        <Select
          size="xs"
          label="Color by"
          data={characterColorOptions}
          value={characterColor}
          onChange={(value) => {
            if (value) setCharacterColor(value);
          }}
        />
      </div>
    </div>
  );
}
export default PlotOptions;
