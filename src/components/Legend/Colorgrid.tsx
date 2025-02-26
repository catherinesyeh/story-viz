import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";
import { getColor, getGroupColor, getCustomColor } from "../../utils/colors";
import { activeAttrInScene } from "../../utils/helpers";

function Colorgrid(props: any) {
  const {
    sortedCharacters,
    chapterDivisions,
    activeChapters,
    characterScenes,
    customColorDict,
    character_data,
  } = dataStore();
  const {
    characterColor,
    groupHover,
    setGroupHover,
    characterHover,
    setCharacterHover,
    hidden,
    setHidden,
    customHover,
    setCustomHover,
    setLegendHover,
    linkHover,
  } = storyStore();
  const gridType = props.gridType;

  const fullWidth = props.fullWidth || false;

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

  // Update array with list of hidden characters
  const updateHidden = (name: string) => {
    const newHidden = hidden.includes(name)
      ? hidden.filter((item: string) => item !== name)
      : [...hidden, name];
    setHidden(newHidden);
  };

  const hideAll = (groupChars: any) => {
    const groupNames = groupChars.map((char: any) => char.character);
    // add all characters in group to hidden if any are not hidden already
    const newHidden = hidden;
    groupNames.forEach((name: string) => {
      if (!newHidden.includes(name)) {
        newHidden.push(name);
      }
    });
    setHidden(newHidden);
  };

  const showAll = (groupChars: any) => {
    const groupNames = groupChars.map((char: any) => char.character);
    // remove all characters in group from hidden if any are hidden
    const newHidden = hidden.filter(
      (name: string) => !groupNames.includes(name)
    );
    setHidden(newHidden);
  };

  const allCharsInHidden = (groupChars: any) => {
    const groupNames = groupChars.map((char: any) => char.character);
    return groupNames.every((name: string) => hidden.includes(name));
  };

  const sortedGroups = Object.keys(customColorDict).includes(gridType)
    ? sortedCharacters.map((char) => char[gridType]?.val)
    : sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  // map characters to groups
  const characterGroups = uniqueGroups.map((group) => {
    return Object.keys(customColorDict).includes(gridType)
      ? sortedCharacters.filter((char) => char[gridType]?.val === group)
      : sortedCharacters.filter((char) => char.group === group);
  });

  if (Object.keys(customColorDict).includes(gridType)) {
    // sort based on order in customColorDict
    characterGroups.sort((a, b) => {
      // sort groups by group name
      const aValue = a[0][gridType]?.val;
      const bValue = b[0][gridType]?.val;

      const aIndex = customColorDict[gridType].findIndex(
        (item) => item.val === aValue
      );
      const bIndex = customColorDict[gridType].findIndex(
        (item) => item.val === bValue
      );

      return aIndex - bIndex;
    });
  }

  return (
    <div
      id="colorgrid"
      className={
        gridType === ""
          ? "hidden"
          : "" +
            (!fullWidth &&
            window &&
            window.innerWidth < 1500 &&
            window.innerWidth > 1200
              ? " large"
              : fullWidth
              ? " full-width"
              : "")
      }
      style={{
        width: fullWidth
          ? "100%"
          : gridType === "group" ||
            Object.keys(customColorDict).includes(gridType)
          ? characterGroups.length * 12
          : (gridType === "default" || gridType === "llm") &&
            sortedCharacters.length <
              (window && window.innerWidth < 1500 && window.innerWidth > 1200
                ? 40
                : 25)
          ? sortedCharacters.length * 12
          : undefined,
      }}
    >
      {/* create a square for each character, color determined by gridType */}
      {(gridType === "default" || gridType === "llm") &&
        sortedCharacters.map((char) => {
          const color =
            characterColor === "llm" && char.color
              ? char.color
              : getColor(char.character, sortedCharacters);
          return (
            <div
              key={char.character}
              className={
                "colorgrid-square " +
                (activeCharacters
                  .map((c) => c.character)
                  .includes(char.character)
                  ? ""
                  : "faded no-click") +
                (hidden.includes(char.character) ||
                (characterHover !== "" && characterHover !== char.character) ||
                (linkHover.length > 0 && !linkHover.includes(char.character)) ||
                (groupHover !== "" && groupHover !== char.group)
                  ? "faded"
                  : "")
              }
              style={{ backgroundColor: color }}
              onClick={() => updateHidden(char.character)}
              onMouseEnter={() => {
                setCharacterHover(char.character);
                setLegendHover(char.character);
              }}
              onMouseLeave={() => {
                setCharacterHover("");
                setLegendHover("");
              }}
            ></div>
          );
        })}
      {(gridType === "group" ||
        Object.keys(customColorDict).includes(gridType)) &&
        characterGroups.map((group) => {
          const groupName =
            gridType === "group" ? group[0].group : group[0][gridType]?.val;
          const color =
            gridType === "group"
              ? getGroupColor(groupName, uniqueGroups)
              : getCustomColor(
                  customColorDict[gridType],
                  character_data,
                  group[0].character,
                  gridType
                );
          const charNames = group.map((char) => char.character);
          const charGroups = group.map((char) => char.group);
          return (
            <div
              key={groupName}
              className={
                "colorgrid-square " +
                ((characterHover !== "" &&
                  !charNames.includes(characterHover)) ||
                (linkHover.length > 0 &&
                  !charNames.some((name) => linkHover.includes(name))) ||
                (groupHover !== "" && !charGroups.includes(groupHover)) ||
                (customHover !== "" &&
                  !activeAttrInScene(
                    charNames,
                    character_data,
                    characterColor,
                    customHover
                  )) ||
                allCharsInHidden(group)
                  ? "faded"
                  : "")
              }
              style={{ backgroundColor: color }}
              onMouseEnter={() => {
                if (gridType === "group") {
                  setGroupHover(groupName);
                  setLegendHover(groupName);
                } else {
                  setCustomHover(groupName);
                  setLegendHover(group[0][gridType]?.val);
                }
              }}
              onMouseLeave={() => {
                if (gridType === "group") {
                  setGroupHover("");
                } else {
                  setCustomHover("");
                }
                setLegendHover("");
              }}
              onClick={() => {
                if (!allCharsInHidden(group)) {
                  hideAll(group);
                } else {
                  showAll(group);
                }
              }}
            ></div>
          );
        })}
    </div>
  );
}

export default Colorgrid;
