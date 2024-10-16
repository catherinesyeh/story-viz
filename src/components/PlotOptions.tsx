import { Select, Divider, Button, Switch } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { useEffect, useState } from "react";
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
    setCharacterHover,
    setLocationHover,
    setSceneHover,
    setHidden,
    showChapters,
    setShowChapters,
    yAxis,
    setYAxis,
    fullHeight,
    setFullHeight,
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
    sortedCharacters,
    ratingDict,
    resetActiveChapters,
    activeChapters,
    chapterDivisions,
    num_chapters,
  } = dataStore();
  const { setPositions, setPaths } = positionStore();
  const colorByOptions = [
    "conflict",
    "sentiment",
    "importance",
    "length",
    "default",
  ];
  const characterColorOptions = ["default", "llm", "sentiment", "importance"];
  const sizeByOptions = ["conflict", "importance", "length", "default"];
  const overlayOptions = ["conflict", "importance", "length", "none"];
  const storyOptions = [
    "gatsby",
    "gatsby2",
    "gatsby-new",
    "gatsby-mov",
    "alice",
    "alice2",
    "alice-new",
    "alice-mov",
    "wizard",
    "wizard-new",
    "wizard-mov",
    "aladdin",
    "pride",
    "pride-new",
    "romeo",
    "romeo-new",
    "yourname",
    "yourname-new",
    "sound",
    "anne",
    "anne-new",
    "coco",
    "mendips",
    "mendips-new",
  ].sort();
  const yAxisOptions = [
    "location",
    "character",
    "character (stacked)",
    "importance",
    "sentiment",
  ];

  const [scaleByLength, setScaleByLength] = useState(false);

  const set_pos = () => {
    if (scene_data) {
      setPositions(
        scene_data,
        scenes,
        locations,
        characterScenes,
        sceneLocations,
        sceneCharacters,
        sortedCharacters,
        !scaleByLength,
        ratingDict,
        yAxis
      );
    }
  };

  const handleStoryChange = async () => {
    try {
      const new_data = await import(`../data/${story}.json`);
      // update data once story is loaded
      if (data !== new_data.default) {
        setData(new_data.default);
        // reset the following values
        setHidden([]);
        setLocationHover("");
        setCharacterHover("");
        setSceneHover("");
      }
    } catch (error) {
      console.log("Error loading story data", error);
    }
  };

  const updatePaths = () => {
    if (scene_data) {
      // find active scenes based on active chapters
      const activeChapterDivisions =
        chapterDivisions &&
        chapterDivisions.filter((_, i) => {
          return i >= activeChapters[0] - 1 && i < activeChapters[1];
        });
      const lastActiveChapter =
        activeChapterDivisions[activeChapterDivisions.length - 1];
      const numScenesInLastActiveChapter = lastActiveChapter.scenes.length;
      const activeScenes = [
        activeChapterDivisions[0].index,
        activeChapterDivisions[activeChapterDivisions.length - 1].index +
          numScenesInLastActiveChapter,
      ] as [number, number];

      setPaths(
        scene_data,
        scenes,
        locations,
        characterScenes,
        sceneLocations,
        sceneCharacters,
        sortedCharacters,
        !scaleByLength,
        ratingDict,
        yAxis,
        activeScenes
      );
    }
  };

  useEffect(() => {
    handleStoryChange();
  }, [story]);

  useEffect(() => {
    set_pos();
    if (scenes.length < 24) {
      setFullHeight(false);
    }
  }, [scene_data, scaleByLength, yAxis]);

  // useEffect(() => {
  //   // change character color based on y-axis
  //   if (yAxis === "sentiment") {
  //     setCharacterColor("sentiment");
  //   } else if (yAxis === "importance") {
  //     setCharacterColor("importance");
  //   } else {
  //     setCharacterColor("llm");
  //   }
  // }, [yAxis]);

  useEffect(() => {
    updatePaths();
  }, [activeChapters]);

  return (
    <div id="options">
      <div className="options-contain">
        <b>Visualization Settings</b>
        <div className="options-inner">
          <Switch
            size="xs"
            label="Full height"
            labelPosition="left"
            checked={fullHeight}
            disabled={scenes.length < 24}
            onChange={(event) => setFullHeight(event.currentTarget.checked)}
          />
          <Select
            size="xs"
            data={storyOptions}
            label="Story"
            value={story}
            onChange={(value) => {
              if (value) setStory(value);
            }}
          />

          <Select
            size="xs"
            data={yAxisOptions}
            label="Y Axis"
            value={yAxis}
            onChange={(value) => {
              if (value) setYAxis(value);
            }}
          />

          <Button
            size="xs"
            onClick={() => {
              resetAll();
              resetActiveChapters(num_chapters);
              setScaleByLength(false);
            }}
          >
            Reset All
          </Button>
        </div>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <span>
          <b>Chapters</b>
        </span>
        <div className="options-inner">
          <Switch
            size="xs"
            label="Show"
            labelPosition="left"
            checked={showChapters}
            onChange={(event) => setShowChapters(event.currentTarget.checked)}
          />
        </div>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <b>Scenes</b>
        <div className="options-inner">
          <Select
            size="xs"
            label="Font size"
            data={sizeByOptions}
            value={sizeBy}
            onChange={(value) => {
              if (value) setSizeBy(value);
            }}
          />
          <Select
            size="xs"
            label="Font weight"
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
          <Select
            size="xs"
            label="Overlay"
            data={overlayOptions}
            value={overlay}
            onChange={(value) => {
              if (value) setOverlay(value);
            }}
          />
          <Switch
            size="xs"
            label="Scale by length"
            labelPosition="left"
            checked={scaleByLength}
            onChange={(event) => setScaleByLength(event.currentTarget.checked)}
          />
        </div>
        <i className="annotation">
          Font = <span>low</span> -{" "}
          <span style={{ fontFamily: med_conflict_font }}>medium</span> -{" "}
          <span
            style={{
              fontFamily: high_conflict_font,
              letterSpacing: 1,
              transform: "skewX(-10deg)",
              display: "inline-block",
            }}
          >
            high
          </span>{" "}
          conflict in scene
        </i>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <span>
          <b>Character Paths</b>
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
