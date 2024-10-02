import "./App.scss";
import ChapterSlider from "./components/ChapterSlider";
import PlotOptions from "./components/PlotOptions";
import StoryVis from "./components/StoryVis";
import { dataStore } from "./stores/dataStore";
import { Button, Divider } from "@mantine/core";
import { FiFileText } from "react-icons/fi";

function App() {
  const { data } = dataStore();
  return (
    <div id="app">
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
      <div id="story-contain">
        <StoryVis />
      </div>
      <ChapterSlider />
    </div>
  );
}

export default App;
