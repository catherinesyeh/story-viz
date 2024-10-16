import { useRef, useEffect } from "react";
import "./App.scss";
import ChapterSlider from "./components/XAxis/ChapterSlider";
import LegendDiv from "./components/LegendDiv";
import PlotOptions from "./components/PlotOptions";
import StoryVis from "./components/StoryVis";
import { dataStore } from "./stores/dataStore";
import { Button, Divider } from "@mantine/core";
import { FiFileText } from "react-icons/fi";
import YAxisDiv from "./components/YAxis/YAxisDiv";
import { storyStore } from "./stores/storyStore";
import { positionStore } from "./stores/positionStore";
import { location_height } from "./utils/consts";
import SceneDiv from "./components/Overlays/SceneDiv";

function App() {
  const { data, scene_data } = dataStore();
  const { plotHeight } = positionStore();
  const {
    setStoryMarginTop,
    storyMarginTop,
    story,
    fullHeight,
    yAxisHeight,
    yAxis,
    setStoryScrollX,
    storyScrollX,
    overlay,
  } = storyStore();
  const headerRef = useRef<HTMLDivElement>(null);

  const ratio = yAxisHeight / plotHeight;
  const margin =
    story.includes("-new") &&
    !fullHeight &&
    (yAxis === "location" || yAxis === "character")
      ? 160 * ratio
      : yAxis === "location" || yAxis === "character"
      ? 160
      : 20;

  const handleResize = () => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.clientHeight - 5;
      setStoryMarginTop(headerHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (document) {
      const elem = document.getElementById("story-contain");
      if (elem) {
        elem.scrollTo({
          left: storyScrollX,
          //   behavior: "smooth",
        });
      }
    }
  }, [storyScrollX]);

  const handleScroll = (e: HTMLElement) => {
    const scroll = e.scrollLeft;
    setStoryScrollX(scroll);
  };

  useEffect(() => {
    if (scene_data) handleResize();
  }, [scene_data]);
  return (
    <div id="app">
      <div id="header-container" ref={headerRef}>
        <header>
          <div id="story-header">
            <a href={data["url"]} target="_blank" title={data["title"]}>
              <img
                src={data["image"]}
                alt={data["title"]}
                className="story-image"
              />
            </a>
            <div id="story-info">
              <h1>{data["title"]}</h1>
              <span>
                {data["author"] ? data["author"] : data["director"]}{" "}
                <Divider orientation="vertical" /> {data["year"]}{" "}
                <Divider orientation="vertical" />{" "}
                <a href={data["url"]} target="_blank" title={data["title"]}>
                  <Button
                    size="xs compact"
                    variant="light"
                    id="info-button"
                    leftSection={<FiFileText />}
                  >
                    Full {data["type"] === "Movie" ? "Script" : "Text"}
                  </Button>
                </a>
              </span>
            </div>
          </div>

          <PlotOptions />
        </header>
        <LegendDiv />
      </div>

      <div
        id="story-contain"
        style={{
          marginTop: storyMarginTop,
          width: `calc(100% - ${margin}px)`,
          marginLeft: `calc(${margin}px - 1rem`,
          marginBottom: fullHeight
            ? `${
                location_height * 2.5 * ratio +
                (overlay !== "none" ? 80 : 0) +
                40
              }px`
            : "40px",
        }}
        onScroll={(e) => {
          handleScroll(e.currentTarget);
        }}
      >
        <YAxisDiv />
        <StoryVis />
      </div>
      <ChapterSlider />
      <SceneDiv />
    </div>
  );
}

export default App;
