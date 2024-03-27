import { Switch, Select, Divider } from "@mantine/core";
import { storyStore } from "../stores/store";
import { dataStore } from "../stores/dataStore";
import { useEffect } from "react";

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
    story,
    setStory,
  } = storyStore();

  const { data, setData } = dataStore();
  const colorByOptions = ["conflict", "emotion", "importance", "default"];
  const characterColorOptions = ["default", "emotion", "importance"];
  const sizeByOptions = ["conflict", "importance", "default"];
  const storyOptions = ["gatsby", "gatsby2"];

  const handleStoryChange = async (value: string) => {
    // change story
    setStory(value);
    const newData = await import(`../data/${value}.json`);
    setData(newData);
  };

  useEffect(() => {
    if (data) {
      const title = data["title"];
      console.log(title);
    }
  }, [data]); // Reacts to changes in storyData

  return (
    <div id="options">
      <div className="options-contain">
        <b>Choose Story</b>
        <div className="options-inner">
          <Select
            size="xs"
            // label="View"
            data={storyOptions}
            value={story}
            onChange={(value) => {
              if (value) handleStoryChange(value);
            }}
          />
        </div>
      </div>
      <Divider orientation="vertical" />
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
        <span>
          <b>Character Squares</b> (size = importance)
        </span>
        <div className="options-inner">
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
    </div>
  );
}
export default PlotOptions;
