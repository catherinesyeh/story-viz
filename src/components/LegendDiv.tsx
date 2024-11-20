import { Button } from "@mantine/core";
import { dataStore } from "../stores/dataStore";
import { storyStore } from "../stores/storyStore";
import { getColor, getGroupColor, textColorLLM } from "../utils/colors";
// import CharacterDiv from "./Overlays/CharacterDiv";
import { FaChevronUp, FaRedo, FaPlus, FaMinus } from "react-icons/fa";

function LegendDiv(props: any) {
  const {
    sortedCharacters,
    chapterDivisions,
    activeChapters,
    characterScenes,
  } = dataStore();

  const {
    setCharacterHover,
    characterHover,
    groupHover,
    hidden,
    characterColor: characterColorBy,
    setHidden,
    showLegend,
    setShowLegend,
    setGroupHover,
    minimized,
    setMinimized,
  } = storyStore();

  const inSidebar = props.inSidebar || false;

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

  const noCharsInHidden = (groupChars: any) => {
    const groupNames = groupChars.map((char: any) => char.character);
    return groupNames.every((name: string) => !hidden.includes(name));
  };

  const allCharsInHidden = (groupChars: any) => {
    const groupNames = groupChars.map((char: any) => char.character);
    return groupNames.every((name: string) => hidden.includes(name));
  };

  // Update array with list of minimized groups
  const updateMinimized = (group: string) => {
    const newMinimized = minimized.includes(group)
      ? minimized.filter((item: string) => item !== group)
      : [...minimized, group];
    setMinimized(newMinimized);
  };

  const minimizeAll = () => {
    const newMinimized = sortedCharacters.map((char) => char.group);
    setMinimized(newMinimized);
  };

  const expandAll = () => {
    setMinimized([]);
  };

  const allMinized = () => {
    return (
      minimized.length === sortedCharacters.map((char) => char.group).length
    );
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

  const maxChars = inSidebar ? 28 : 18;
  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  // map characters to groups
  const characterGroups = uniqueGroups.map((group) => {
    return sortedCharacters.filter((char) => char.group === group);
  });

  return (
    <div id="legend-outer" className={inSidebar ? "sidebar" : ""}>
      <div id="buttons">
        <Button
          size="xs"
          variant="transparent"
          rightSection={<FaChevronUp />}
          className={
            "show-button reset-button " + (!showLegend ? "rotate" : "")
          }
          onClick={() => setShowLegend(!showLegend)}
        >
          {showLegend ? "Hide legend" : "Show legend"}
        </Button>
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
      </div>
      <div id="character-legend" className={!showLegend ? "hidden" : ""}>
        {characterGroups.map((groupChars, index) => {
          const group = groupChars[0].group;
          const numChars = groupChars.length;
          const charNames = groupChars.map((char) => char.character);
          const groupColor = getGroupColor(group, uniqueGroups).replace(
            ")",
            ", 0.5)"
          );
          const fontColor = textColorLLM(groupColor);

          const num_columns = inSidebar
            ? 2
            : numChars < 30
            ? Math.ceil(numChars / 8)
            : Math.ceil(numChars / 12);

          return (
            <div
              key={index}
              className={
                "group-container " +
                ((characterHover !== "" &&
                  !charNames.includes(characterHover)) ||
                (groupHover !== "" && groupHover !== group)
                  ? "faded"
                  : "") +
                (allCharsInHidden(groupChars) ? " light-faded" : "")
              }
              style={{
                borderColor: groupColor,
                gridColumn: `span ${num_columns}`,
              }}
            >
              <div
                className={
                  "group-header " +
                  (minimized.includes(group) ? "no-margin" : "")
                }
                style={{ backgroundColor: groupColor, color: fontColor }}
                onMouseEnter={() => setGroupHover(group)}
                onMouseLeave={() => setGroupHover("")}
              >
                <b onClick={() => updateMinimized(group)}>
                  <span className="expand-button">
                    {minimized.includes(group) ? <FaPlus /> : <FaMinus />}
                  </span>
                  {group} ({numChars})
                </b>
                <div>
                  <span
                    onClick={() => hideAll(groupChars)}
                    className={allCharsInHidden(groupChars) ? "faded" : ""}
                  >
                    hide all
                  </span>
                  <span className="divider">/</span>
                  <span
                    onClick={() => showAll(groupChars)}
                    className={noCharsInHidden(groupChars) ? "faded" : ""}
                  >
                    show all
                  </span>
                </div>
              </div>
              <div
                className={
                  "group-contain-inner " +
                  (minimized.includes(group) ? "hidden" : "")
                }
              >
                {groupChars.map((character) => {
                  const color =
                    characterColorBy === "llm" && character.color
                      ? character.color
                      : getColor(character.character, sortedCharacters);
                  const name = character.character;
                  const displayName =
                    name.length > maxChars
                      ? name.slice(0, maxChars) + "..."
                      : name;

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
                      onMouseEnter={() =>
                        setCharacterHover(character.character)
                      }
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
            </div>
          );
        })}
        <Button
          size="compact-xs"
          className="compact-button"
          fullWidth
          disabled={minimized.length === 0}
          onClick={() => {
            expandAll();
          }}
          style={{ marginTop: "0.15rem" }}
        >
          Expand All
        </Button>
        <Button
          size="compact-xs"
          className="compact-button"
          fullWidth
          disabled={allMinized()}
          onClick={() => {
            minimizeAll();
          }}
          style={{ marginTop: "0.15rem" }}
        >
          Minimize All
        </Button>
      </div>
      {/* <CharacterDiv /> */}
      {/* <LocationDiv /> */}
    </div>
  );
}
export default LegendDiv;
