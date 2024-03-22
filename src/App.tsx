import "./App.scss";
import StoryVis from "./components/StoryVis";
import { title } from "./utils/data";

import { Select, Switch } from "@mantine/core";
import { storyStore } from "./store";

function App() {
  const {
    showCharacterEmotions,
    setShowCharacterEmotions,
    showConflict,
    setShowConflict,
    colorBy,
    setColorBy,
  } = storyStore();
  const colorByOptions = ["conflict", "emotion", "importance"];

  return (
    <div id="app">
      <header>
        <h1>{title}</h1>
        <div id="options">
          <Switch
            size="xs"
            label="Show character emotions"
            labelPosition="left"
            checked={showCharacterEmotions}
            onChange={(event) =>
              setShowCharacterEmotions(event.currentTarget.checked)
            }
          />
          <Switch
            size="xs"
            label="Show conflict overlay"
            labelPosition="left"
            checked={showConflict}
            onChange={(event) => setShowConflict(event.currentTarget.checked)}
          />
          <Select
            disabled={!showConflict}
            size="xs"
            label="Color by"
            data={colorByOptions}
            value={colorBy}
            onChange={(value) => {
              if (value) setColorBy(value);
            }}
          />
        </div>
      </header>
      <div id="story-contain">
        <StoryVis />
      </div>
    </div>
  );
}

export default App;
