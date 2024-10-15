import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";

function CharacterAxis() {
  const { yAxisHeight, setCharacterHover, hidden, setHidden } = storyStore();
  const { sortedCharacters } = dataStore();
  const { plotHeight, charInc } = positionStore();
  const ratio = yAxisHeight / plotHeight;
  const maxCharLength = 24;
  // Update array with list of hidden characters
  const updateHidden = (name: string) => {
    const newHidden = hidden.includes(name)
      ? hidden.filter((item: string) => item !== name)
      : [...hidden, name];
    setHidden(newHidden);
  };
  return (
    <div id="character-axis">
      {sortedCharacters.map((char) => {
        return (
          <p
            key={char.character}
            className={
              "character-name " +
              (hidden.includes(char.character) ? "faded" : "")
            }
            style={{ height: charInc * ratio }}
            onMouseEnter={() => setCharacterHover(char.character)}
            onMouseLeave={() => setCharacterHover("")}
            onClick={() => updateHidden(char.character)}
          >
            {char && char.short
              ? char.short
              : char.character.length > maxCharLength
              ? char.character.slice(0, maxCharLength) + "..."
              : char.character}
          </p>
        );
      })}
    </div>
  );
}

export default CharacterAxis;
