import { Select, Divider, Button, Switch } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { useEffect } from "react";
import { positionStore } from "../stores/positionStore";
import Colorbar from "./XAxis/Colorbar";
import Colorgrid from "./XAxis/Colorgrid";

function PlotOptions() {
  const {
    characterColor,
    setCharacterColor,
    story,
    setStory,
    resetAll,
    setCharacterHover,
    setLocationHover,
    setSceneHover,
    setHidden,
    yAxis,
    setYAxis,
    fullHeight,
    setFullHeight,
    chapterView,
    setChapterView,
  } = storyStore();

  const { data, setData, scenes, resetActiveChapters, num_chapters } =
    dataStore();
  const { plotHeight } = positionStore();
  const characterColorOptions = [
    "default",
    "llm",
    "group",
    "sentiment",
    "importance",
  ];
  const storyOptions = [
    "gatsby",
    "gatsby2",
    "gatsby-new",
    "gatsby-new-themes",
    "gatsby-mov",
    "alice",
    "alice2",
    "alice-new",
    "alice-new-themes",
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
    "frankenstein-new",
    "threads-new",
    "time-new",
    "time-new-themes",
    "whispers-new",
    "victoria-new",
    "starlight-new",
    "bookstore-new",
    "bookstore-new-themes",
    "color-new",
    "color-new-themes",
  ].sort();
  // const yAxisOptions = [
  //   "location",
  //   "character",
  //   "character (stacked)",
  //   "importance",
  //   "sentiment",
  // ];
  const yAxisOptions = [
    { label: "location", value: "location" },
    {
      label: story.includes("-themes") ? "themes" : "character",
      value: "character",
    },
    {
      label: story.includes("-themes")
        ? "themes (stacked)"
        : "character (stacked)",
      value: "character (stacked)",
    },
    { label: "importance", value: "importance" },
    { label: "sentiment", value: "sentiment" },
  ];

  const handleStoryChange = async () => {
    try {
      const new_data = await import(`../data/${story}.json`);
      // update data once story is loaded
      if (data !== new_data.default) {
        let viewChapters = false;
        if (
          new_data.default["chapters"] &&
          new_data.default["chapters"].length > 0
        ) {
          viewChapters = true;
        }

        setData(new_data.default, viewChapters);
        setChapterView(viewChapters);

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

  useEffect(() => {
    handleStoryChange();
  }, [story]);

  useEffect(() => {
    setData(data, chapterView);
  }, [chapterView]);

  return (
    <div id="options">
      <div className="options-contain">
        <b>Visualization Settings</b>
        <div className="options-inner">
          <Switch
            size="xs"
            label="Chapter view"
            labelPosition="left"
            checked={chapterView}
            disabled={!story.includes("-new")}
            onChange={(event) => setChapterView(event.currentTarget.checked)}
          />
          <Switch
            size="xs"
            label="Full height"
            labelPosition="left"
            checked={fullHeight}
            disabled={scenes.length < 24 && plotHeight < 800}
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
            }}
          >
            Reset All
          </Button>
        </div>
      </div>
      <Divider orientation="vertical" />
      <div className="options-contain">
        <span>
          <b>{story.includes("-themes") ? "Themes" : "Characters"}</b>
        </span>
        <div
          className={
            "options-inner " +
            (characterColor !== "sentiment" && characterColor !== "importance"
              ? "color"
              : "")
          }
        >
          <Select
            size="xs"
            label="Color"
            data={characterColorOptions}
            value={characterColor}
            onChange={(value) => {
              if (value) setCharacterColor(value);
            }}
          />
          <Colorbar
            barType={
              characterColor === "sentiment" || characterColor === "importance"
                ? characterColor
                : "default"
            }
          />
          <Colorgrid
            gridType={
              characterColor === "default" ||
              characterColor === "llm" ||
              characterColor === "group"
                ? characterColor
                : ""
            }
          />
        </div>
        <i className="annotation">Size = relative importance in scene</i>
      </div>
    </div>
  );
}
export default PlotOptions;
