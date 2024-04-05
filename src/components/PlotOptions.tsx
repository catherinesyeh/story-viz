import { Select, Divider, Button } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { useEffect } from "react";
import { positionStore } from "../stores/positionStore";
import { high_conflict_font, med_conflict_font } from "../utils/consts";

function PlotOptions() {
  const {
    characterColor,
    setCharacterColor,
    overlay,
    setOverlay,
    colorBy,
    setColorBy,
    sizeBy,
    setSizeBy,
    story,
    setStory,
    weightBy,
    setWeightBy,
    resetAll,
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
    sortedCharacters,
  } = dataStore();
  const { setPositions } = positionStore();
  const colorByOptions = ["conflict", "sentiment", "importance", "default"];
  const characterColorOptions = ["default", "sentiment", "importance"];
  const sizeByOptions = ["conflict", "importance", "default"];
  const overlayOptions = ["conflict", "importance", "none"];
  const storyOptions = [
    "gatsby",
    "gatsby2",
    "alice",
    "wizard",
    "aladdin",
    "pride",
    "romeo",
  ];

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
        sortedCharacters
      );
    }
  }, [data]);

  return (
    <div id="options">
      <div className="options-contain">
        <b>Visualization Settings</b>
        <div className="options-inner">
          <Select
            size="xs"
            data={storyOptions}
            label="Story"
            value={story}
            onChange={(value) => {
              if (value) setStory(value);
            }}
          />
          <Button size="xs" onClick={resetAll}>
            Reset All
          </Button>
        </div>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <b>Scene Overlay</b>
        <div className="options-inner">
          {/* <Switch
            size="xs"
            label="Show"
            labelPosition="left"
            checked={showConflict}
            onChange={(event) => setShowConflict(event.currentTarget.checked)}
          /> */}
          <Select
            size="xs"
            label="Show"
            data={overlayOptions}
            value={overlay}
            onChange={(value) => {
              if (value) setOverlay(value);
            }}
          />
          <Select
            disabled={overlay === "none"}
            size="xs"
            label="Color"
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
            label="Size"
            data={sizeByOptions}
            value={sizeBy}
            onChange={(value) => {
              if (value) setSizeBy(value);
            }}
          />
          <Select
            size="xs"
            label="Weight"
            data={sizeByOptions}
            value={weightBy}
            onChange={(value) => {
              if (value) setWeightBy(value);
            }}
          />
          <Select
            size="xs"
            label="Color"
            data={colorByOptions}
            value={colorBy}
            onChange={(value) => {
              if (value) setColorBy(value);
            }}
          />
        </div>
        <i className="annotation">
          Font = <span>low</span> -{" "}
          <span style={{ fontFamily: med_conflict_font, fontWeight: 600 }}>
            medium
          </span>{" "}
          -{" "}
          <span style={{ fontFamily: high_conflict_font, fontWeight: 500 }}>
            high
          </span>{" "}
          conflict in scene
        </i>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <span>
          <b>Character Squares</b>
        </span>
        <div className="options-inner">
          <Select
            size="xs"
            label="Color"
            data={characterColorOptions}
            value={characterColor}
            onChange={(value) => {
              if (value) setCharacterColor(value);
            }}
          />
        </div>
        <i className="annotation">Size = relative importance in scene</i>
      </div>
    </div>
  );
}
export default PlotOptions;
