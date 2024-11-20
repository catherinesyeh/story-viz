import { Select, Divider, Button, Switch } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import { dataStore } from "../stores/dataStore";
import { useEffect } from "react";
import { positionStore } from "../stores/positionStore";
import Sidebar from "./Sidebar";
import LocationDiv from "./Overlays/LocationDiv";
import CharacterDiv from "./Overlays/CharacterDiv";

function PlotOptions() {
  const {
    story,
    setStory,
    resetAll,
    setCharacterHover,
    setLocationHover,
    setSceneHover,
    setGroupHover,
    setHidden,
    yAxis,
    setYAxis,
    fullHeight,
    setFullHeight,
    chapterView,
    setChapterView,
    themeView,
    setThemeView,
    setMinimized,
  } = storyStore();

  const { data, setData, scenes, resetActiveChapters, num_chapters } =
    dataStore();
  const { plotHeight } = positionStore();
  const storyOptions = [
    "gatsby",
    // "gatsby2",
    "gatsby-new",
    "gatsby-new-themes",
    "gatsby-mov",

    "alice",
    // "alice2",
    "alice-new",
    "alice-new-themes",
    "alice-mov",

    "wizard",
    "wizard-new",
    "wizard-new-themes",
    "wizard-mov",

    "aladdin",

    "pride",
    "pride-new",
    "pride-new-themes",

    "romeo",
    "romeo-new",
    "romeo-new-themes",

    "yourname",
    "yourname-new",
    "yourname-new-themes",

    "sound",

    "anne",
    "anne-new",
    "anne-new-themes",

    "coco",

    "mendips",
    "mendips-new",
    "mendips-new-themes",

    "frankenstein-new",
    "frankenstein-new-themes",

    "threads-new",
    "threads-new-themes",

    "time-new",
    "time-new-themes",

    "whispers-new",
    "whispers-new-themes",

    "victoria-new",
    "victoria-new-themes",

    "starlight-new",
    "starlight-new-themes",

    "bookstore-new",
    "bookstore-new-themes",

    "color-new",
    "color-new-themes",

    "emma-new",
    "emma-new-themes",

    "greatexp-new",
    "greatexp-new-themes",
  ].sort();

  const storyOptionsDisplay = storyOptions.filter(
    (s) => !s.includes("-themes")
  );

  const yAxisOptions = [
    { label: "location", value: "location" },
    {
      label: themeView ? "themes" : "character",
      value: "character",
    },
    {
      label: themeView ? "themes (stacked)" : "character (stacked)",
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

        if (
          themeView &&
          !story.includes("-themes") &&
          !storyOptions.includes(story + "-themes")
        ) {
          setThemeView(false);
        }

        setData(new_data.default, viewChapters);
        setChapterView(viewChapters);

        // reset the following values
        setHidden([]);
        setMinimized([]);
        setLocationHover("");
        setCharacterHover("");
        setSceneHover("");
        setGroupHover("");
      }
    } catch (error) {
      console.log("Error loading story data", error);
    }
  };

  useEffect(() => {
    if (
      themeView &&
      !story.includes("-themes") &&
      storyOptions.includes(story + "-themes")
    ) {
      setStory(story + "-themes");
    }
    handleStoryChange();
  }, [story]);

  useEffect(() => {
    setData(data, chapterView);
  }, [chapterView]);

  useEffect(() => {
    if (themeView) {
      setStory(story + "-themes");
    } else {
      setStory(story.replace("-themes", ""));
    }
  }, [themeView]);

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
            disabled={
              (scenes.length < 24 && plotHeight < 800) ||
              (chapterView &&
                story.includes("-themes") &&
                (yAxis === "sentiment" || yAxis.includes("stacked")))
            }
            onChange={(event) => setFullHeight(event.currentTarget.checked)}
          />
          <Switch
            size="xs"
            label={(chapterView ? "Chapter" : "Scene") + " view"}
            labelPosition="left"
            checked={chapterView}
            disabled={!story.includes("-new")}
            onChange={(event) => setChapterView(event.currentTarget.checked)}
            style={{ width: 85 }}
          />
          <Switch
            size="xs"
            label={(themeView ? "Theme" : "Character") + " view"}
            labelPosition="left"
            checked={themeView}
            disabled={
              !story.includes("-themes") &&
              !storyOptions.includes(story + "-themes")
            }
            onChange={(event) => setThemeView(event.currentTarget.checked)}
            style={{ width: 95 }}
          />

          <Select
            size="xs"
            data={storyOptionsDisplay}
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
          <Divider orientation="vertical" />
          <Sidebar />
        </div>
      </div>
      {/* <Divider orientation="vertical" /> */}
      {/* <div className="options-contain">
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
      <Divider orientation="vertical" /> */}
      {/* <div className="options-contain">
        <b>Characters / Scenes</b>
        <div className="options-inner">
          <Sidebar />
        </div>
      </div> */}
      <CharacterDiv />
      <LocationDiv />
    </div>
  );
}
export default PlotOptions;
