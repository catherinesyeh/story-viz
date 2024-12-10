import { dataStore } from "../../stores/dataStore";
import { positionStore } from "../../stores/positionStore";
import { storyStore } from "../../stores/storyStore";
import { getGroupColor } from "../../utils/colors";
import { location_height } from "../../utils/consts";

function CharacterAxis() {
  const {
    yAxisHeight,
    characterHover,
    setCharacterHover,
    hidden,
    setHidden,
    story,
    fullHeight,
    groupHover,
    chapterView,
  } = storyStore();
  const { sortedCharacters } = dataStore();
  const { plotHeight, charInc } = positionStore();
  const ratio = plotHeight < location_height ? 1 : yAxisHeight / plotHeight;
  const maxCharLength = 16;
  // Update array with list of hidden characters
  const updateHidden = (name: string) => {
    const newHidden = hidden.includes(name)
      ? hidden.filter((item: string) => item !== name)
      : [...hidden, name];
    setHidden(newHidden);
  };

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];
  return (
    <div id="character-axis" style={{ paddingTop: fullHeight ? 10 : 5 }}>
      {sortedCharacters.map((char) => {
        return (
          <p
            key={char.character}
            className={
              "character-name " +
              (hidden.includes(char.character) ||
              (groupHover !== "" && groupHover !== char.group) ||
              (characterHover !== "" && characterHover !== char.character)
                ? "faded"
                : "")
            }
            style={{
              height: charInc * ratio,
              borderColor: getGroupColor(char.group, uniqueGroups),
              borderWidth:
                story.includes("-new") && !fullHeight && !chapterView ? 2 : 4,
            }}
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
