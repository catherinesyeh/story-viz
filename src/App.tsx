import { useState, useRef, useEffect } from "react";
import "./App.scss";
import ChapterSlider from "./components/ChapterSlider";
import LegendDiv from "./components/LegendDiv";
import PlotOptions from "./components/PlotOptions";
import StoryVis from "./components/StoryVis";
import { dataStore } from "./stores/dataStore";
import { Button, Divider } from "@mantine/core";
import { FiFileText } from "react-icons/fi";

function App() {
  const { data, scene_data } = dataStore();

  const [marginTop, setMarginTop] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleResize = () => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.clientHeight - 10;
      setMarginTop(headerHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

      <div id="story-contain" style={{ marginTop: marginTop }}>
        <StoryVis />
      </div>
      <ChapterSlider />
    </div>
  );
}

export default App;
