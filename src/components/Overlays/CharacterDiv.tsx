import { useEffect, useState } from "react";
import { dataStore } from "../../stores/dataStore";
import { storyStore } from "../../stores/storyStore";
import { getColor, getLLMColor, textColorLLM } from "../../utils/colors";

function CharacterDiv() {
  const { characterHover, characterColor } = storyStore();
  const { character_data, sortedCharacters } = dataStore();

  const [accentColor, setAccentColor] = useState("rgb(0, 0, 0)");
  const [characterName, setCharacterName] = useState("");
  const [characterGroup, setCharacterGroup] = useState("");
  const [characterQuote, setCharacterQuote] = useState("");
  const [characterExplanation, setCharacterExplanation] = useState("");

  useEffect(() => {
    if (characterHover !== "") {
      const character = character_data.find(
        (c) => c.character === characterHover
      );
      if (character) {
        const charColor = getColor(character.character, sortedCharacters);
        const llmColor =
          getLLMColor(character.character, sortedCharacters) || charColor;
        if (characterColor === "llm") {
          setAccentColor(llmColor);
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
      style={{ borderColor: accentColor.split(")")[0] + ", 0.3)" }}
      className={characterHover !== "" ? "" : "hidden"}
    >
      <div className="character-inner grid">
        <img className="character-image" src={"characters/placeholder.png"} />
        <div>
          <b style={{ color: accentColor }}>
            {characterName || "Character"} ({characterGroup || "Group"})
          </b>
          <p>{characterQuote || "Quote"}</p>
        </div>
      </div>
      <div
        className={
          "character-inner explanation " +
          (characterExplanation ? "" : "hidden")
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
