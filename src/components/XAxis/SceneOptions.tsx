import { Switch } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import ChapterSlider from "./ChapterSlider";
import { extractChapterName } from "../../utils/helpers";
import InfoTooltip from "../Misc/InfoTooltip";

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
  } = storyStore();

  const {
    scene_data,
    scenes,
    locations,
    characterScenes,
    sceneLocations,
    sceneCharacters,
    sortedCharacters,
    ratingDict,
    chapterDivisions,
    customYAxisOptions,
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
        yAxis,
        customYAxisOptions
      );
    }
  };

  useEffect(() => {
    if (isUpdatingData) return;
    set_pos();
    if (
      (scenes.length < 24 && plotHeight < 800) ||
      (chapterView &&
        themeView &&
        (yAxis === "sentiment" || yAxis.includes("stacked")))
    ) {
      setFullHeight(false);
    }
  }, [scene_data, plotHeight, scaleByLength, yAxis, isUpdatingData]);

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
          <span>
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
              className={first_chapter && last_chapter ? "" : "hidden"}
            />

            <ChapterSlider />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SceneOptions;
