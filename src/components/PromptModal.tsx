import { Button, Modal, Textarea } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import { useState } from "react";
import { getNewColors } from "../server";
import { dataStore } from "../stores/dataStore";
import { defaultCharacterColors } from "../utils/colors";

function PromptModal() {
  const {
    character_data,
    setCharacterData,
    setCustomColorDict,
    customColorDict,
    characterColorOptions,
    setCharacterColorOptions,
    sortedCharacters,
    setSortedCharacters,
  } = dataStore();
  const {
    story,
    modalOpened,
    setModalOpened,
    themeView,
    modalLoading,
    setModalLoading,
    setCharacterColor,
    modalType,
    characterColor,
  } = storyStore();

  const [colorDesc, setColorDesc] = useState("");

  const closeModal = () => {
    if (modalLoading) return;
    setModalOpened(false);
  };

  const addColor = async () => {
    setModalLoading(true);
    // add color

    try {
      const localStorageKey = `characterData-${story}`;

      // try retrieving character data from local storage
      let charData = localStorage.getItem(localStorageKey);

      if (!charData) {
        // if not found, use the character_data object
        charData = JSON.stringify(character_data); // Convert object to string
      }

      const storyType = themeView ? "theme" : "character";

      const res = await getNewColors(charData, colorDesc, storyType);
      const char_attrs = res["char_attrs"];
      const attr_colors = res["color_assignments"];

      const color_lower = colorDesc.toLowerCase();

      // update character_data with new attributes
      const new_char_data = character_data.map((char) => {
        const c = char_attrs.find((c: any) => c.character === char.character);
        const char_val = c?.val;
        const char_exp = c?.exp;

        const new_attr = { [color_lower]: { val: char_val, exp: char_exp } };
        return {
          ...char,
          ...new_attr,
        };
      });
      setCharacterData(new_char_data, story);

      // and sorted characters
      const new_sorted_chars = sortedCharacters.map((char) => {
        const c = char_attrs.find((c: any) => c.character === char.character);
        const char_val = c?.val;
        const char_exp = c?.exp;

        const new_attr = { [color_lower]: { val: char_val, exp: char_exp } };
        return {
          ...char,
          ...new_attr,
        };
      });
      setSortedCharacters(new_sorted_chars);

      // update characterColorOptions with new color description
      setCharacterColorOptions([...characterColorOptions, color_lower]);
      // update customColorDict with new color assignments
      setCustomColorDict(
        { ...customColorDict, [color_lower]: attr_colors },
        story
      );
      // reset colorDesc
      setColorDesc("");

      // set CharacterColor to new color description
      setCharacterColor(color_lower);
    } catch (e) {
      console.error("Error fetching new colors:", e);
      setColorDesc("Error");
    }

    setModalLoading(false);
    closeModal();
  };

  const removeColor = () => {
    setModalLoading(true);

    // remove color from customColorDict
    const newColorDict = { ...customColorDict };
    delete newColorDict[characterColor];
    setCustomColorDict(newColorDict, story);

    // remove color from characterColorOptions
    const newColorOptions = characterColorOptions.filter(
      (color) => color !== characterColor
    );
    setCharacterColorOptions(newColorOptions);

    // remove color from character_data and sortedCharacters
    const new_char_data = [...character_data];
    new_char_data.forEach((char) => {
      delete char[characterColor];
    });

    const new_sorted_chars = [...sortedCharacters];
    new_sorted_chars.forEach((char) => {
      delete char[characterColor];
    });

    setCharacterData(new_char_data, story);
    setSortedCharacters(new_sorted_chars);

    // reset characterColor to default (LLM)
    setCharacterColor("llm");

    setModalLoading(false);
    closeModal();
  };

  return (
    <Modal
      opened={modalOpened}
      onClose={() => closeModal()}
      title={
        modalType === "deleteColor"
          ? "🗑️ Delete custom color scheme"
          : "✨ Add custom color scheme"
      }
      centered
      size={"lg"}
      id="prompt-modal"
    >
      {modalType === "deleteColor" ? (
        <>
          <p>
            Are you sure you want to delete the color: <b>{characterColor}</b>?
          </p>
          <div
            style={{
              display: "flex",
              columnGap: "0.5rem",
              paddingTop: "0.75rem",
            }}
          >
            <Button
              size="xs"
              onClick={() => closeModal()}
              variant="outline"
              disabled={modalLoading}
            >
              <span>Cancel</span>
            </Button>
            <Button
              size="xs"
              onClick={() => removeColor()}
              disabled={modalLoading}
            >
              <span className={modalLoading ? "loading" : ""}>
                {modalLoading ? "Loading..." : "Confirm"}
              </span>
            </Button>
          </div>
        </>
      ) : (
        <>
          <Textarea
            size="xs"
            label={`I would like to color the ${
              themeView ? "themes" : "characters"
            } by...`}
            rows={2}
            value={colorDesc}
            onChange={(e) => setColorDesc(e.currentTarget.value)}
            placeholder="Enter description here (e.g., gender, age, etc.)"
          />

          <Button
            size="xs"
            fullWidth
            disabled={
              modalLoading ||
              colorDesc === "" ||
              Object.keys(customColorDict).includes(colorDesc.toLowerCase()) ||
              defaultCharacterColors.includes(colorDesc.toLowerCase())
            }
            onClick={() => addColor()}
            style={{ marginTop: "0.75rem" }}
          >
            <span className={modalLoading ? "loading" : ""}>
              {modalLoading ? "Loading..." : "Go"}
            </span>
          </Button>
        </>
      )}
    </Modal>
  );
}

export default PromptModal;
