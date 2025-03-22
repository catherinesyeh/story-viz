import { Button, Modal, Textarea } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { useState } from "react";
import { getNewColors, getNewYAxis } from "../../server";
import { dataStore } from "../../stores/dataStore";
import { defaultCharacterColors } from "../../utils/colors";
import { defaultYAxisOptions } from "../../utils/consts";
import localforage from "localforage";

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
    customYAxisOptions,
    yAxisOptions,
    setCustomYAxisOptions,
    setYAxisOptions,
    setSceneData,
    chapter_data,
    setChapterData,
    setOgSceneData,
    og_scene_data,
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
    yAxis,
    setYAxis,
    chapterView,
  } = storyStore();

  const [colorDesc, setColorDesc] = useState("");
  const [paletteInfo, setPaletteInfo] = useState("");

  const closeModal = () => {
    if (modalLoading) return;
    setModalOpened(false);
  };

  const addColor = async () => {
    setModalLoading(true);

    try {
      const localStorageKey = `characterData-${story}`;
      let charData;

      try {
        charData = await localforage.getItem(localStorageKey);
        if (charData) {
          charData = JSON.stringify(charData);
        } else {
          charData = JSON.stringify(character_data); // Use fallback data
        }
      } catch (e) {
        console.error("Error retrieving character data from local storage:", e);
        charData = JSON.stringify(character_data); // Fallback to character_data
      }

      const storyType = themeView ? "theme" : "character";

      const res = await getNewColors(
        charData,
        colorDesc,
        paletteInfo,
        storyType
      );
      const char_attrs = res["char_attrs"];
      const attr_colors = res["color_assignments"];

      const color_lower = colorDesc.toLowerCase();

      // Update character_data with new attributes
      const new_char_data = character_data.map((char) => {
        const c = char_attrs.find((c: any) => c.character === char.character);
        let char_val = c?.val;
        let char_exp = c?.exp;

        if (!char_val) {
          char_val = "n/a";
        }
        if (!char_exp) {
          char_exp = "No explanation provided.";
        }

        const new_attr = { [color_lower]: { val: char_val, exp: char_exp } };
        return {
          ...char,
          ...new_attr,
        };
      });
      setCharacterData(new_char_data, story);

      // Update sorted characters
      const new_sorted_chars = sortedCharacters.map((char) => {
        const c = char_attrs.find((c: any) => c.character === char.character);
        let char_val = c?.val;
        let char_exp = c?.exp;

        if (!char_val) {
          char_val = "n/a";
        }
        if (!char_exp) {
          char_exp = "No explanation provided.";
        }

        const new_attr = { [color_lower]: { val: char_val, exp: char_exp } };
        return {
          ...char,
          ...new_attr,
        };
      });
      setSortedCharacters(new_sorted_chars);

      // Update characterColorOptions
      setCharacterColorOptions([...characterColorOptions, color_lower]);

      // Update customColorDict
      setCustomColorDict(
        { ...customColorDict, [color_lower]: attr_colors },
        story
      );

      // Reset colorDesc
      setColorDesc("");
      // and paletteInfo
      setPaletteInfo("");

      // Set characterColor to the new color description
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

  const addYAxis = async () => {
    setModalLoading(true);

    try {
      const sceneStorageKey = `sceneData-${story}`;
      let sceneData;

      try {
        sceneData = await localforage.getItem(sceneStorageKey);
        if (sceneData) {
          console.log(
            "SceneView: Using og scene data from local storage",
            sceneData
          );
          sceneData = JSON.stringify(sceneData);
        } else {
          sceneData = JSON.stringify(og_scene_data); // Use fallback data
          console.log(
            "SceneView: Using og_scene_data as fallback",
            og_scene_data
          );
        }
      } catch (e) {
        console.error("Error retrieving scene data from local storage:", e);
        sceneData = JSON.stringify(og_scene_data); // Fallback to scene_data
      }
      // }

      const storyType = themeView ? "theme" : "character";

      const res = await getNewYAxis(sceneData, colorDesc, storyType);
      const new_data = res["new_data"];

      const color_lower = colorDesc.toLowerCase();

      // Update chapter_data
      const new_chapter_data = [...chapter_data];
      new_chapter_data.forEach((chapter) => {
        const scenes = new_data.filter(
          (scene: any) => scene.chapter === chapter.chapter
        );
        const chapter_chars = chapter.characters;
        chapter_chars.forEach((char) => {
          const name = char.name;
          const char_scenes = scenes.filter((scene: any) =>
            scene.characters.map((c: any) => c.name).includes(name)
          );
          const char_vals = char_scenes.map(
            (scene: any) =>
              scene.characters.find((c: any) => c.name === name)?.[color_lower]
          );
          const char_val =
            char_vals.reduce((a: number, b: number) => a + b, 0) /
            char_vals.length;
          char[color_lower] = char_val;
        });

        // Rank characters in chapter by new y axis
        const sorted_chars = chapter_chars
          .map((char) => ({ name: char.name, rating: char[color_lower] }))
          .sort((a, b) => a.rating - b.rating);

        chapter_chars.forEach((char) => {
          const rank = sorted_chars.findIndex((c) => c.name === char.name);
          char[color_lower] = rank + 1;
        });
      });

      // Set chapter_data to the updated data
      setChapterData(new_chapter_data);

      if (chapterView) {
        // Set new_chapter_data as scene_data
        setSceneData(new_chapter_data);
      } else {
        // Set new_data as scene_data
        setSceneData(new_data);
      }

      setOgSceneData(new_data, story);

      // Update yAxisOptions
      setYAxisOptions([...yAxisOptions, color_lower]);

      // Update customYAxisOptions
      setCustomYAxisOptions([...customYAxisOptions, color_lower], story);

      // Reset colorDesc
      setColorDesc("");

      // Set yAxis to the new color description
      setYAxis(color_lower);
    } catch (e) {
      console.error("Error fetching new colors:", e);
      setColorDesc("Error");
    }

    setModalLoading(false);
    closeModal();
  };

  const removeYAxis = () => {
    setModalLoading(true);

    // remove yAxis from customYAxisOptions
    const newYAxisOptions = customYAxisOptions.filter((axis) => axis !== yAxis);
    setCustomYAxisOptions(newYAxisOptions, story);

    // remove yAxis from yAxisOptions
    const newYAxis = yAxisOptions.filter((axis) => axis !== yAxis);
    setYAxisOptions(newYAxis);

    // remove color from character_data and sortedCharacters
    const new_scene_data = [...og_scene_data];
    new_scene_data.forEach((scene) => {
      const chars = scene.characters;
      chars.forEach((char) => {
        delete char[yAxis];
      });
    });

    // remove yAxis from chapter_data
    const new_chapter_data = [...chapter_data];
    new_chapter_data.forEach((chapter) => {
      const chars = chapter.characters;
      chars.forEach((char) => {
        delete char[yAxis];
      });
    });

    setChapterData(new_chapter_data);

    if (chapterView) {
      // Set new_chapter_data as scene_data
      setSceneData(new_chapter_data);
    } else {
      // Set new_data as scene_data
      setSceneData(new_scene_data);
    }

    setOgSceneData(new_scene_data, story);

    // reset yAxis to default (location)
    setYAxis("location");

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
          : modalType === "deleteYAxis"
          ? "🗑️ Delete custom y-axis"
          : modalType === "addColor"
          ? "✨ Add custom color scheme"
          : modalType === "addY"
          ? "✨ Add custom y-axis"
          : "🗑️ Clear local storage"
      }
      centered
      size={"lg"}
      id="prompt-modal"
    >
      {modalType.includes("delete") ? (
        <>
          {modalType === "deleteColor" ? (
            <p>
              Are you sure you want to delete the color: <b>{characterColor}</b>
              ?
            </p>
          ) : modalType === "deleteYAxis" ? (
            <p>
              Are you sure you want to delete the y-axis: <b>{yAxis}</b>?
            </p>
          ) : (
            <p>Are you sure you want to clear your local storage?</p>
          )}
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
              onClick={() => {
                if (modalType === "deleteColor") {
                  removeColor();
                } else if (modalType === "deleteYAxis") {
                  removeYAxis();
                } else {
                  if (modalLoading) return;
                  setModalLoading(true);
                  localforage.clear().then(() => {
                    setModalLoading(false);
                    closeModal();
                    window.location.reload();
                  });
                }
              }}
              disabled={modalLoading}
            >
              <span className={modalLoading ? "loading" : ""}>
                {modalLoading ? "Loading..." : "Confirm"}
              </span>
            </Button>
          </div>
        </>
      ) : modalType === "addColor" ? (
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

          <Textarea
            size="xs"
            label={`(Optional) Any color palette preferences? `}
            rows={1}
            value={paletteInfo}
            onChange={(e) => setPaletteInfo(e.currentTarget.value)}
            placeholder="Enter preferences here (e.g., pastels, green for low / purple for high, etc.)"
            style={{ marginTop: "0.25rem" }}
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
      ) : (
        <>
          <Textarea
            size="xs"
            label={`I would like to rank the ${
              themeView ? "themes" : "characters"
            } in each scene by...`}
            rows={2}
            value={colorDesc}
            onChange={(e) => setColorDesc(e.currentTarget.value)}
            placeholder="Enter description here (e.g., conflict level, presence, etc.)"
          />

          <Button
            size="xs"
            fullWidth
            disabled={
              modalLoading ||
              colorDesc === "" ||
              customYAxisOptions.includes(colorDesc.toLowerCase()) ||
              defaultYAxisOptions.includes(colorDesc.toLowerCase())
            }
            onClick={() => addYAxis()}
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
