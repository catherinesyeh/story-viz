import { Switch } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { useEffect } from "react";
import { positionStore } from "../../stores/positionStore";
import ChapterSlider from "./ChapterSlider";
import { extractChapterName } from "../../utils/helpers";

function SceneOptions() {
  const {
    showChapters,
    setShowChapters,
    yAxis,
    setFullHeight,
    themeView,
    chapterView,
    scaleByLength,
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
    activeChapters,
    chapterDivisions,
  } = dataStore();
  const { setPaths, setPositions, plotHeight } = positionStore();

  let first_chapter = chapterDivisions ? chapterDivisions[0].chapter : "";
  first_chapter = extractChapterName(first_chapter);
  let last_chapter = chapterDivisions
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
        yAxis
      );
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
    set_pos();
    if (
      (scenes.length < 24 && plotHeight < 800) ||
      (chapterView &&
        themeView &&
        (yAxis === "sentiment" || yAxis.includes("stacked")))
    ) {
      setFullHeight(false);
    }
  }, [scene_data, plotHeight, scaleByLength, yAxis]);

  useEffect(() => {
    updatePaths();
  }, [activeChapters]);

  return (
    <div id="slider-contain">
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
              label="Show labels"
              labelPosition="left"
              checked={showChapters}
              onChange={(event) => setShowChapters(event.currentTarget.checked)}
            />

            <ChapterSlider />
          </div>
        </div>
        {/* <Divider orientation="vertical" />
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
            <Colorbar barType={colorBy} />
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
              onChange={(event) =>
                setScaleByLength(event.currentTarget.checked)
              }
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
        </div> */}
      </div>
    </div>
  );
}

export default SceneOptions;
