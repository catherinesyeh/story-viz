import { Switch, Select, Divider } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { useEffect, useState } from "react";
import { positionStore } from "../stores/positionStore";

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

  const {
    data,
    setData,
    scene_data,
    scenes,
    locations,
    characterScenes,
    sceneLocations,
    sceneCharacters,
    location_quotes,
    sceneSummaries,
    character_quotes,
    reverseCharacterNames,
  } = dataStore();
  const { setPositions } = positionStore();
  const colorByOptions = ["conflict", "emotion", "importance", "default"];
  const characterColorOptions = ["default", "emotion", "importance"];
  const sizeByOptions = ["conflict", "importance", "default"];
  const storyOptions = ["gatsby", "alice"];

  const [story, setStory] = useState("gatsby");

  const handleStoryChange = async (story: string) => {
    try {
      // change story
      setStory(story);
      const new_data = await import(`../data/${story}.json`);
      // update data once story is loaded
      setData(new_data.default);
    } catch (error) {
      console.log("Error loading story data", error);
    }
  };

  useEffect(() => {
    handleStoryChange(story);
  }, [story]);

  useEffect(() => {
    if (data) {
      setPositions(
        scene_data,
        scenes,
        locations,
        characterScenes,
        sceneLocations,
        sceneCharacters,
        location_quotes,
        sceneSummaries,
        character_quotes,
        reverseCharacterNames
      );
    }
  }, [data]);

  return (
    <div id="options">
      <div className="options-contain">
        <b>Choose Story</b>
        <div className="options-inner">
          <Select
            size="xs"
            data={storyOptions}
            value={story}
            onChange={(value) => {
              if (value) setStory(value);
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
