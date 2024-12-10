import { useRef, useEffect } from "react";
import "./App.scss";
import PlotOptions from "./components/Header/PlotOptions";
import StoryVis from "./components/Vis/StoryVis";
import { dataStore } from "./stores/dataStore";
import YAxisDiv from "./components/YAxis/YAxisDiv";
import { storyStore } from "./stores/storyStore";
import { positionStore } from "./stores/positionStore";
import { location_height, scene_overlay_width } from "./utils/consts";
import SceneDiv from "./components/Overlays/SceneDiv";
import SceneOptions from "./components/XAxis/SceneOptions";
import AuthWrapper from "./components/AuthWrapper";
import ChapterSidebar from "./components/Overlays/ChapterSidebar";
import StoryInfo from "./components/Header/StoryInfo";
import ClickMsg from "./components/Overlays/ClickMsg";

function App() {
  const { scene_data } = dataStore();
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
    showOverlay,
    showLegend,
    chapterView,
    detailView,
  } = storyStore();
  const headerRef = useRef<HTMLDivElement>(null);

  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;
  const margin =
    story.includes("-new") &&
    !fullHeight &&
    !chapterView &&
    (yAxis === "location" || yAxis === "character")
      ? 160 * ratio
      : yAxis === "location" || yAxis === "character"
      ? 140
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
  }, [scene_data, showLegend, headerRef.current]);
  return (
    <AuthWrapper>
      <div id="app">
        <div id="header-container" ref={headerRef}>
          <header>
            <StoryInfo />
            <PlotOptions />
          </header>
          {/* <LegendDiv /> */}
        </div>

        <div
          id="story-contain"
          style={{
            marginTop: storyMarginTop,
            width: `calc(100% - ${
              margin + (detailView ? scene_overlay_width : 0)
            }px)`,
            marginLeft: `calc(${margin}px - 1rem`,
            marginBottom:
              fullHeight ||
              (window &&
                plotHeight * ratio >
                  window.innerHeight -
                    storyMarginTop -
                    (story.includes("-new") && !chapterView ? 150 : 250))
                ? `${
                    location_height * 2.5 * ratio +
                    (showOverlay ? 80 : 0) +
                    40 +
                    (story.includes("-new") && !chapterView ? 40 : 0)
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

        <ChapterSidebar />
        <SceneOptions />
        <SceneDiv />
        <ClickMsg />
      </div>
    </AuthWrapper>
  );
}

export default App;
