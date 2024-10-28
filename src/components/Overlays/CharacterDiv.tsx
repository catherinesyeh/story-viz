import { useEffect, useState } from "react";
import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";
import {
  getColor,
  getGroupColor,
  getLLMColor,
  textColorLLM,
} from "../../utils/colors";
import { onlyLetters } from "../../utils/helpers";
import ImageDiv from "../ImageDiv";

function CharacterDiv() {
  const { characterHover, characterColor, story, storyMarginTop } =
    storyStore();
  const { character_data, sortedCharacters } = dataStore();

  const [accentColor, setAccentColor] = useState("rgb(0, 0, 0)");
  const [changeMargin, setChangeMargin] = useState(true);
  const [characterName, setCharacterName] = useState("");
  const [characterGroup, setCharacterGroup] = useState("");
  const [characterQuote, setCharacterQuote] = useState("");
  const [characterExplanation, setCharacterExplanation] = useState("");

  const [marginTop, setMarginTop] = useState(0);

  const buffer = 30;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!changeMargin) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      let curX = event.clientX;
      let curY = event.clientY;
      const overlay = document.getElementById("character-info") as HTMLElement;
      const coords = overlay.getBoundingClientRect();

      if (
        curY + buffer >= coords.top &&
        curY - buffer <= coords.bottom &&
        curX + buffer >= coords.left &&
        curX - buffer <= coords.right
      ) {
        setMarginTop(curY - storyMarginTop + buffer);
      } else {
        setMarginTop(0);
      }
    };

    // Add event listener to track mouse movement
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  useEffect(() => {
    if (characterHover !== "") {
      const character = character_data.find(
        (c) => c.character === characterHover
      );
      if (character) {
        const charColor = getColor(character.character, sortedCharacters);
        const llmColor =
          getLLMColor(character.character, sortedCharacters) || charColor;
        const groupColor = getGroupColor(character.group, uniqueGroups);
        if (characterColor === "llm") {
          setAccentColor(llmColor);
        } else if (characterColor === "group") {
          setAccentColor(groupColor);
        } else {
          setAccentColor(charColor);
        }
        setCharacterName(character.character);
        setCharacterGroup(character.group);
        setCharacterQuote(character.quote);
        const flat_explanation = Array.isArray(character.explanation)
          ? character.explanation.join(" ").trim()
          : character.explanation;
        setCharacterExplanation(flat_explanation);
      }
    }
  }, [characterHover, characterColor]);

  return (
    <div
      id="character-info"
      style={{
        borderColor: accentColor.split(")")[0] + ", 0.3)",
        marginTop: "calc(" + marginTop + "px + 1rem)",
      }}
      className={characterHover !== "" ? "" : "hidden"}
      onMouseEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setChangeMargin(false);
      }}
      onMouseLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setChangeMargin(true);
      }}
    >
      <div className="character-inner grid">
        <ImageDiv
          className="character-image"
          src={
            "characters/" +
            onlyLetters(story.replace("-mov", "")) +
            "/" +
            character_data.find((c) => c.character === characterHover)?.key +
            ".png"
          }
          placeholder="characters/placeholder.png"
        />
        <div>
          <b style={{ color: accentColor }}>
            {characterName || "Character"} ({characterGroup || "Group"})
          </b>
          <p>{'"' + characterQuote + '"' || "Quote"}</p>
        </div>
      </div>
      <div
        className={
          "character-inner explanation " +
          (characterExplanation && characterColor === "llm" ? "" : "hidden")
        }
        style={{ background: accentColor.split(")")[0] + ", 0.6)" }}
      >
        <p style={{ color: textColorLLM(accentColor) }}>
          {characterExplanation}
        </p>
      </div>
    </div>
  );
}

export default CharacterDiv;
