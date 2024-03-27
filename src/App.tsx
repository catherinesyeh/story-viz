import "./App.scss";
import PlotOptions from "./components/PlotOptions";
import StoryVis from "./components/StoryVis";
import { storyStore } from "./stores/store";

// map story variable to title
const titleMap = {
  gatsby: "The Great Gatsby",
  gatsby2: "The Great Gatsby 2",
} as { [key: string]: string };

function App() {
  const { story } = storyStore();
  return (
    <div id="app">
      <header>
        <h1>{titleMap[story]}</h1>
        <PlotOptions />
      </header>
      <div id="story-contain">
        <StoryVis />
      </div>
    </div>
  );
}

export default App;
