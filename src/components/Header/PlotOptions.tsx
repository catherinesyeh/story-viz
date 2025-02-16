import { Select, Divider, Button, Switch } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { useEffect, useState } from "react";
import { positionStore } from "../../stores/positionStore";
import Sidebar from "../Sidebar";
import LocationDiv from "../Overlays/LocationDiv";
import CharacterDiv from "../Overlays/CharacterDiv";
import { isSameStory } from "../../utils/helpers";
import { defaultCharacterColors } from "../../utils/colors";
import localforage from "localforage";
import { defaultYAxisOptions } from "../../utils/consts";

function PlotOptions() {
  const {
    story,
    setStory,
    resetAll,
    setCharacterHover,
    setLocationHover,
    setSceneHover,
    setGroupHover,
    setCustomHover,
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
    detailView,
    setDetailView,
    chapterHover,
    setChapterHover,
    characterColor,
    setCharacterColor,
    isBackendActive,
    setModalOpened,
    setModalType,
    isUpdatingData,
    setIsUpdatingData,
  } = storyStore();

  const {
    data,
    setData,
    scenes,
    resetActiveChapters,
    num_chapters,
    yAxisOptions,
    customYAxisOptions,
  } = dataStore();
  const { plotHeight } = positionStore();
  const storyOptions = [
    "gatsby",
    // "gatsby2",
    "gatsby-new",
    // "gatsby2-new",
    "gatsby-new-themes",
    // "gatsby-mov",

    "alice",
    // "alice2",
    "alice-new",
    // "alice2-new",
    "alice-new-themes",
    // "alice-mov",

    "wizard",
    "wizard-new",
    "wizard-new-themes",
    // "wizard-mov",

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

  const myYAxisOptions = yAxisOptions.map((y) => {
    if (y === "character") {
      return { label: themeView ? "themes" : "character", value: y };
    } else if (y === "character (stacked)") {
      return {
        label: themeView ? "themes (stacked)" : "character (stacked)",
        value: y,
      };
    }

    return { label: y, value: y };
  });

  const [prevStory, setPrevStory] = useState(story);

  const handleStoryChange = async () => {
    try {
      const localStorageKey = `characterData-${story}`;
      const sceneStorageKey = `sceneData-${story}`;

      console.log("Loading story data from file");
      const new_data = await import(`../../data/${story}.json`);

      // Retrieve character data
      let characterData = await localforage
        .getItem(localStorageKey)
        .catch((error) => {
          console.error("Error loading character data", error);
          return null;
        });

      if (characterData) {
        console.log("Using cached character data");
        new_data.default["characters"] = characterData;
      } else {
        console.log("Saving character data to cache");
        characterData = new_data.default["characters"];
        localforage.setItem(localStorageKey, characterData);
      }

      // Retrieve scene data
      let sceneData = await localforage
        .getItem(sceneStorageKey)
        .catch((error) => {
          console.error("Error loading scene data", error);
          return null;
        });

      if (sceneData) {
        console.log("Using cached scene data");
        new_data.default["scenes"] = sceneData;
      } else {
        console.log("Saving scene data to cache");
        sceneData = new_data.default["scenes"];
        localforage.setItem(sceneStorageKey, sceneData);
      }

      // Ensure `updateData` doesn't conflict with `useEffect`
      if (!isUpdatingData) {
        await updateData(new_data.default);
      }
    } catch (error) {
      console.error("Error loading story data", error);
    }
  };

  // Helper function to update the data
  const updateData = async (data: any) => {
    if (isUpdatingData) return; // Prevent concurrent execution

    setIsUpdatingData(true); // Mark as running

    try {
      let viewChapters = false;
      const sameStory = isSameStory(story, prevStory);

      if (
        data["chapters"] &&
        data["chapters"].length > 0 &&
        (!sameStory || (sameStory && chapterView))
      ) {
        viewChapters = true;
      }

      if (!viewChapters && detailView && !sameStory) {
        setDetailView(false);
      }

      if (
        themeView &&
        !story.includes("-themes") &&
        !storyOptions.includes(story + "-themes")
      ) {
        setThemeView(false);
      }

      let chapter = "";
      if (
        chapterHover !== "" &&
        (!data["chapters"] ||
          (data["chapters"] &&
            !data["chapters"].some((c: any) => c.chapter === chapterHover)))
      ) {
        setChapterHover("");
      } else if (chapterHover !== "" && !chapterView && detailView) {
        chapter = chapterHover;
      }

      setData(
        data,
        story,
        viewChapters,
        chapter,
        sameStory && story === prevStory
      );
      setChapterView(viewChapters);

      // Reset hover and hidden states
      setHidden([]);
      setMinimized([]);
      setLocationHover("");
      setCharacterHover("");
      setSceneHover("");
      setGroupHover("");
      setCustomHover("");

      // Reset characterColor if it's not a valid option
      const localStorageKey = `colorDict-${story}`;
      let stored_colors = await localforage
        .getItem(localStorageKey)
        .catch((error) => {
          console.error("Error loading colors", error);
          return null;
        });

      let all_colors = [...defaultCharacterColors];
      if (stored_colors) {
        const new_colors = Object.keys(stored_colors).filter(
          (c) => !all_colors.includes(c)
        );
        all_colors = [...all_colors, ...new_colors];
      }

      if (!all_colors.includes(characterColor)) {
        setCharacterColor("llm");
      }

      // Reset y-axis if it's not a valid option
      const yAxisKey = `yAxis-${story}`;
      let stored_yAxis = await localforage.getItem(yAxisKey).catch((error) => {
        console.error("Error loading y-axis", error);
        return null;
      });

      let all_yAxis = [...defaultYAxisOptions];
      if (stored_yAxis) {
        const new_yAxis = (stored_yAxis as string[]).filter(
          (y: string) => !all_yAxis.includes(y)
        );
        all_yAxis = [...all_yAxis, ...new_yAxis];
      }

      if (!all_yAxis.includes(yAxis)) {
        console.log("Resetting y-axis to default");
        setYAxis("location");
      }

      if (!sameStory) {
        setChapterHover("");
        setPrevStory(story);
      }
    } finally {
      setIsUpdatingData(false); // Mark as completed
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
    if (!isUpdatingData) {
      handleStoryChange();
    }
  }, [story, chapterView]);

  useEffect(() => {
    let chapter = "";
    if (detailView && chapterHover !== "" && !chapterView) {
      chapter = chapterHover;
    }

    if (!isUpdatingData) {
      setData(data, story, chapterView, chapter, true);
    }
  }, [chapterView, detailView, chapterHover]);

  useEffect(() => {
    if (themeView) {
      setStory(story + "-themes");
    } else {
      setStory(story.replace("-themes", ""));
    }
  }, [themeView]);

  useEffect(() => {
    if (!detailView && chapterHover !== "") {
      setChapterHover("");
    }
  }, [detailView]);

  const openModal = (mod_type: string = "addY") => {
    setModalType(mod_type);
    setModalOpened(true);
  };

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
          {/* <Switch
            size="xs"
            label={"Detail view"}
            labelPosition="left"
            checked={detailView}
            disabled={
              !story.includes("-new") || (!chapterView && chapterHover === "")
            }
            onChange={(event) => setDetailView(event.currentTarget.checked)}
          /> */}
          <Switch
            size="xs"
            label={(chapterView ? "Chapter" : "Scene") + " view"}
            labelPosition="left"
            checked={chapterView}
            disabled={
              !story.includes("-new") || (detailView && chapterHover === "")
            }
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

          <div style={{ position: "relative" }}>
            <span
              onClick={() => openModal("deleteYAxis")}
              className={
                "delete-button y-axis " +
                (!customYAxisOptions.includes(yAxis) ? "disabled" : "")
              }
            >
              delete
            </span>
            <Select
              size="xs"
              data={myYAxisOptions}
              label="Y Axis"
              value={yAxis}
              onChange={(value) => {
                if (value) setYAxis(value);
              }}
            />
          </div>

          <Button
            size="xs"
            variant="light"
            title={
              isBackendActive ? "Add custom y-axis" : "Backend is not connected"
            }
            disabled={!isBackendActive}
            onClick={() => openModal()}
          >
            Add custom y-axis
          </Button>

          <Divider orientation="vertical" />
          <Button
            size="xs"
            onClick={() => {
              resetAll();
              resetActiveChapters(num_chapters);
            }}
          >
            Reset All
          </Button>
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
