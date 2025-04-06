import { Switch } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import ChapterSlider from "./ChapterSlider";
import { extractChapterName } from "../../utils/helpers";
import InfoTooltip from "../Misc/InfoTooltip";
import localforage from "localforage";

function SceneOptions() {
  const {
    showChapters,
    setShowChapters,
    yAxis,
    setFullHeight,
    themeView,
    chapterView,
    scaleByLength,
    isUpdatingData,
    modalLoading,
    demoMode,
    story,
  } = storyStore();

  const {
    scene_data,
    scenes,
    locations,
    characterScenes,
    sceneLocations,
    sceneCharacters,
    sortedCharacters,
    chapterDivisions,
    customYAxisOptions,
    character_data,
    og_scene_data,
  } = dataStore();
  const { setPositions, plotHeight } = positionStore();

  let first_chapter =
    chapterDivisions && chapterDivisions[0] ? chapterDivisions[0].chapter : "";
  first_chapter = extractChapterName(first_chapter);
  let last_chapter =
    chapterDivisions && chapterDivisions[chapterDivisions.length - 1]
      ? chapterDivisions[chapterDivisions.length - 1].chapter
      : "";
  last_chapter = extractChapterName(last_chapter);

  const addModifiedData = async () => {
    // add initial formatted scene/character data to localforage
    const localStorageKey = `characterData-${story}`;
    const sceneStorageKey = `sceneData-${story}`;

    // Retrieve character data
    let characterData = await localforage
      .getItem(localStorageKey)
      .catch((error) => {
        console.error("Error loading character data", error);
        return null;
      });

    if (!characterData && character_data) {
      console.log("Saving character data to cache");
      characterData = character_data;
      localforage.setItem(localStorageKey, characterData);
    }

    // Retrieve scene data
    let sceneData = await localforage
      .getItem(sceneStorageKey)
      .catch((error) => {
        console.error("Error loading scene data", error);
        return null;
      });

    if (!sceneData && og_scene_data) {
      console.log("Saving scene data to cache");
      sceneData = og_scene_data;
      localforage.setItem(sceneStorageKey, sceneData);
    }
  };

  const set_pos = () => {
    if (scene_data) {
      addModifiedData();
      setPositions(
        scene_data,
        scenes,
        locations,
        characterScenes,
        sceneLocations,
        sceneCharacters,
        sortedCharacters,
        !scaleByLength,
        yAxis,
        customYAxisOptions
      );
    }
  };

  useEffect(() => {
    if (isUpdatingData || modalLoading) return;
    set_pos();
    if (
      (scenes.length < 24 && plotHeight < 800) ||
      (chapterView &&
        themeView &&
        (yAxis === "sentiment" || yAxis.includes("stacked")))
    ) {
      setFullHeight(false);
    }
  }, [
    scene_data,
    plotHeight,
    scaleByLength,
    yAxis,
    isUpdatingData,
    modalLoading,
  ]);

  return (
    <div
      id="slider-contain"
      className={first_chapter && last_chapter ? "" : "hidden"}
    >
      <div
        id={"options"}
        className={first_chapter && last_chapter ? "slider" : ""}
      >
        <div className={"options-contain"}>
          <span style={{ display: demoMode ? "none" : "" }}>
            <b>Chapters</b>
          </span>
          <div
            className={
              "options-inner " + (first_chapter && last_chapter ? "slider" : "")
            }
          >
            <Switch
              size="xs"
              label={
                <span>
                  Show labels
                  <InfoTooltip label="show chapter divisions + labels in scene view" />
                </span>
              }
              labelPosition="left"
              checked={showChapters}
              disabled={chapterView}
              onChange={(event) => setShowChapters(event.currentTarget.checked)}
              className={
                !demoMode && first_chapter && last_chapter ? "" : "hidden"
              }
            />

            <ChapterSlider />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SceneOptions;
