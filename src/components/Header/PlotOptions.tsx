import { Select, Divider, Button, Switch } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { useEffect, useState } from "react";
import { positionStore } from "../../stores/positionStore";
import Sidebar from "./Sidebar";
import { isSameStory } from "../../utils/helpers";
import { defaultCharacterColors } from "../../utils/colors";
import localforage from "localforage";
import { defaultYAxisOptions } from "../../utils/consts";
import InfoTooltip from "../Misc/InfoTooltip";

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
    setAboutModalOpened,
    setLinkHover,
    setNetworkHover,
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
    // "gatsby",
    "gatsby-new",
    "gatsby-new-themes",

    // "alice",
    "alice-new",
    "alice-new-themes",

    // "wizard",
    "wizard-new",
    "wizard-new-themes",

    // "aladdin",

    // "pride",
    "pride-new",
    "pride-new-themes",

    // "romeo",
    "romeo-new",
    "romeo-new-themes",

    // "yourname",
    // "yourname-new",
    // "yourname-new-themes",

    // "sound",

    // "anne",
    "anne-new",
    "anne-new-themes",

    // "coco",

    // "mendips",
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

    "hamlet-new",
    "hamlet-new-themes",

    "odyssey-new",
    "odyssey-new-themes",

    "donquixote-new",
    "donquixote-new-themes",

    "faust-new",
    "faust-new-themes",

    "war-new",
    "war-new-themes",

    "ulysses-new",
    "ulysses-new-themes",

    "trial-new",
    "trial-new-themes",

    "metamorphosis-new",
    "metamorphosis-new-themes",

    "iliad-new",
    "iliad-new-themes",

    "redchamber-new",
    "redchamber-new-themes",

    "artofwar-new",
    "artofwar-new-themes",

    "genji-new",
    "genji-new-themes",

    "marrow-new",
    "marrow-new-themes",

    "littlewomen-new",
    "littlewomen-new-themes",

    "janeeyre-new",
    "janeeyre-new-themes",

    "pygmalion-new",
    "pygmalion-new-themes",

    "school-new",
    "school-new-themes",

    "tenant-new",
    "tenant-new-themes",

    "candide-new",
    "candide-new-themes",
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

  const addModifiedData = async (data: any) => {
    const localStorageKey = `characterData-${story}`;
    const sceneStorageKey = `sceneData-${story}`;

    // Retrieve character data
    let characterData = await localforage
      .getItem(localStorageKey)
      .catch((error) => {
        console.error("Error loading character data", error);
        return null;
      });

    if (characterData) {
      console.log("Using cached character data");
      data["characters"] = characterData;
    } else {
      console.log("Saving character data to cache");
      characterData = data["characters"];
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
      data["scenes"] = sceneData;
    } else {
      console.log("Saving scene data to cache");
      sceneData = data["scenes"];
      localforage.setItem(sceneStorageKey, sceneData);
    }

    return data;
  };

  const handleStoryChange = async () => {
    try {
      console.log("Loading story data from file");
      const new_data = await import(`../../data/${story}.json`);

      // Retrieve modified data
      const mod_data = await addModifiedData(new_data.default);

      // Ensure `updateData` doesn't conflict with `useEffect`
      if (!isUpdatingData) {
        await updateData(mod_data);
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
      setLinkHover([]);
      setNetworkHover("");

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

  const setDataDetailView = async (chapter: string) => {
    const mod_data = await addModifiedData(data);
    setData(mod_data, story, chapterView, chapter, true);
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
      setDataDetailView(chapter);
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>Visualization Settings</b>
          <b>
            <span
              className="link"
              onClick={() => setAboutModalOpened(true)}
              title="About Story Ribbons"
            >
              📔 About Story Ribbons
            </span>
            <Divider
              orientation="vertical"
              style={{ display: "inline", margin: "0 0.5rem" }}
            />
            <a
              href="https://github.com/catherinesyeh/story-viz"
              target="_blank"
              className="link"
              title={"Github Repo"}
            >
              💻 Github Repo
            </a>
          </b>
        </div>
        <div className="options-inner">
          <Switch
            size="xs"
            label={
              <span>
                Full height
                <InfoTooltip label="false = show all scenes at once" />
              </span>
            }
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
            label={
              <span>
                {(chapterView ? "Chapter" : "Scene") + " view"}
                <InfoTooltip label="explore chapters or scenes" />
              </span>
            }
            labelPosition="left"
            checked={chapterView}
            disabled={
              !story.includes("-new") || (detailView && chapterHover === "")
            }
            onChange={(event) => setChapterView(event.currentTarget.checked)}
            style={{ width: 101 }}
          />
          <Switch
            size="xs"
            label={
              <span>
                {(themeView ? "Theme" : "Character") + " view"}
                <InfoTooltip label="visualize characters or themes" />
              </span>
            }
            labelPosition="left"
            checked={themeView}
            disabled={
              !story.includes("-themes") &&
              !storyOptions.includes(story + "-themes")
            }
            onChange={(event) => setThemeView(event.currentTarget.checked)}
            style={{ width: 112 }}
          />

          <Select
            size="xs"
            data={storyOptionsDisplay}
            label={
              <span>
                Story
                <InfoTooltip label="change the story being visualized" />
              </span>
            }
            value={story}
            onChange={(value) => {
              if (value) setStory(value);
            }}
            searchable
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
              label={
                <span>
                  Y-axis
                  <InfoTooltip
                    label={
                      "change what the y-axis represents" +
                      (chapterView && yAxis === "importance"
                        ? "; importance is determined by # of scenes"
                        : "")
                    }
                  />
                </span>
              }
              value={yAxis}
              onChange={(value) => {
                if (value) setYAxis(value);
              }}
              searchable
            />
          </div>

          <Button
            size="xs"
            variant="gradient"
            gradient={{ from: "#9c85c0", to: "#dd8047", deg: 0 }}
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
    </div>
  );
}
export default PlotOptions;
