import { Button } from "@mantine/core";
import { dataStore } from "../stores/dataStore";
import { storyStore } from "../stores/storyStore";
import { getColor } from "../utils/colors";
import CharacterDiv from "./Overlays/CharacterDiv";
import { FaRedo } from "react-icons/fa";

function LegendDiv() {
  const {
    sortedCharacters,
    chapterDivisions,
    activeChapters,
    characterScenes,
  } = dataStore();

  const {
    setCharacterHover,
    hidden,
    characterColor: characterColorBy,
    setHidden,
  } = storyStore();

  // Update array with list of hidden characters
  const updateHidden = (name: string) => {
    const newHidden = hidden.includes(name)
      ? hidden.filter((item: string) => item !== name)
      : [...hidden, name];
    setHidden(newHidden);
  };

  // active chapters
  const activeChapterDivisions =
    chapterDivisions &&
    chapterDivisions.filter((_, i) => {
      return i >= activeChapters[0] - 1 && i < activeChapters[1];
    });
  const firstActiveChapter = activeChapterDivisions[0];
  const firstActiveScene = firstActiveChapter && firstActiveChapter.index;
  const lastActiveChapter =
    activeChapterDivisions[activeChapterDivisions.length - 1];
  const lastActiveScene =
    lastActiveChapter &&
    lastActiveChapter.index + lastActiveChapter.scenes.length;
  const activeCharacterScenes = characterScenes.filter((charScene) => {
    const scenes = charScene.scenes;
    const filteredScenes = scenes.filter(
      (scene) => scene >= firstActiveScene && scene < lastActiveScene
    );
    return filteredScenes.length > 0;
  });
  const activeCharacters = sortedCharacters.filter((char) => {
    return activeCharacterScenes
      .map((charScene) => charScene.character)
      .includes(char.character);
  });

  const maxChars = 18;
  return (
    <div id="legend-outer">
      <Button
        size="xs"
        variant="transparent"
        leftSection={<FaRedo />}
        className="reset-button"
        disabled={hidden.length === 0}
        onClick={() => setHidden([])}
      >
        Reset
      </Button>
      <div id="character-legend">
        {sortedCharacters.map((character) => {
          const color =
            characterColorBy === "llm" && character.color
              ? character.color
              : getColor(character.character, sortedCharacters);
          const name = character.character;
          const displayName =
            name.length > maxChars ? name.slice(0, maxChars) + "..." : name;
          return (
            <div
              key={character.character}
              className={
                "legend-item " +
                (activeCharacters
                  .map((char) => char.character)
                  .includes(character.character)
                  ? ""
                  : "faded no-click") +
                (hidden.includes(character.character) ? "faded" : "")
              }
              onClick={() => updateHidden(character.character)}
              onMouseEnter={() => setCharacterHover(character.character)}
              onMouseLeave={() => setCharacterHover("")}
            >
              <div
                className="legend-square"
                style={{ backgroundColor: color }}
              ></div>
              <span className="legend-name">{displayName}</span>
            </div>
          );
        })}
      </div>
      <CharacterDiv />
    </div>
  );
}
export default LegendDiv;
