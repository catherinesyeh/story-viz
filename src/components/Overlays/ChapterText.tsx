import { useEffect, useMemo, useState, useRef } from "react";
import { storyStore } from "../../stores/storyStore";
import { extractChapterName, onlyLetters } from "../../utils/helpers";
import { dataStore } from "../../stores/dataStore";
import { Scene } from "../../utils/data";
import {
  emotionColor,
  getColor,
  getGroupColor,
  getLLMColor,
  importanceColor,
  getCustomColor,
} from "../../utils/colors";
import chroma from "chroma-js";
import InfoTooltip from "../Misc/InfoTooltip";
import AskLLMPopover from "../Modals/AskLLMPopover";

function ChapterText() {
  const [chapterText, setChapterText] = useState([] as string[]);
  const [initialSceneSet, setInitialSceneSet] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastChapterViewRef = useRef<boolean | null>(null);
  const {
    chapterHover,
    story,
    setChapterHover,
    chapterView,
    setCurScrollScene,
    curScrollScene,
    scrollSource,
    setScrollSource,
    setStoryScrollX,
    characterColor,
    setCharacterHover,
    setLocationHover,
    setSceneHover,
    verboseMode,
    setVerboseMode,
  } = storyStore();
  const {
    chapter_data,
    scene_data,
    sortedCharacters,
    character_data,
    customColorDict,
  } = dataStore();

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  const loadChapterText = async (chapter: string) => {
    try {
      const story_formatted = onlyLetters(story.split("-")[0]);
      let chapter_formatted = chapter.replace("?", "");

      const response = await fetch(
        `chapters/${story_formatted}/${chapter_formatted}.txt`
      );

      if (!response.ok) {
        throw new Error(`Failed to load chapter ${chapter}`);
      }

      let text = await response.text();

      if (text.includes("<!DOCTYPE html>")) {
        // Retry with a different format
        chapter_formatted = onlyLetters(chapter_formatted);

        const response = await fetch(
          `chapters/${story_formatted}/${onlyLetters(chapter_formatted)}.txt`
        );
        text = await response.text();
      }

      // console.log("Loaded chapter text for", chapter);
      // console.log("chapter_formatted", chapter_formatted);
      // console.log(text);

      // Process the text into an array
      const textArray = text.split("\n").map((line) => {
        const splitLine = line.split(": ");
        return splitLine.length > 1 ? splitLine[1] : line;
      });

      setChapterText(textArray);
      setInitialSceneSet(false); // Reset when new chapter text is loaded
    } catch (error) {
      console.error("Error fetching chapter text:", error);
      setChapterText([]);
    }
  };

  // Setup and cleanup the observer
  const setupObserver = () => {
    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const options = {
      root: null,
      rootMargin: "-50% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // Filter intersecting entries
      const intersectingEntries = entries.filter(
        (entry) => entry.isIntersecting
      );

      // Sort intersecting entries by position in the viewport
      const sortedEntries = intersectingEntries.sort(
        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
      );

      // Pick the first valid intersecting scene
      const intersectingScene = sortedEntries.find((entry) => {
        const sceneName = entry.target.getAttribute("data-scene-name");
        return sceneName && sceneName !== "filler";
      });

      if (intersectingScene) {
        const sceneName =
          intersectingScene.target.getAttribute("data-scene-name");

        // Update state only if the scene changes
        if (
          sceneName &&
          sceneName !== "filler" &&
          sceneName !== curScrollScene
        ) {
          setCurScrollScene(sceneName); // Directly set the string value
        }

        // Set initial scene flag
        if (!initialSceneSet) {
          setInitialSceneSet(true);
        }
      }
    }, options);

    // Observe elements after a short delay to ensure rendering
    setTimeout(() => {
      const sceneElements = document.querySelectorAll(".scene-text-group");
      if (sceneElements.length === 0) {
        console.warn("No scene elements found to observe!");
      } else {
        sceneElements.forEach((element) =>
          observerRef.current?.observe(element)
        );
      }
    }, 100);
  };

  // Reset observer when chapterView changes
  useEffect(() => {
    if (lastChapterViewRef.current !== chapterView) {
      lastChapterViewRef.current = chapterView;
      setInitialSceneSet(false);
      setupObserver();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [chapterView]);

  // Update observer when content changes
  useEffect(() => {
    if (chapterText.length > 0) {
      setInitialSceneSet(false);
      setupObserver();
    }
  }, [chapterText]);

  useEffect(() => {
    if (chapterHover && chapterHover !== "") {
      if (
        chapter_data.some((chapter: Scene) => chapter.chapter === chapterHover)
      ) {
        loadChapterText(chapterHover);
      } else {
        setChapterHover("");
      }
    }
  }, [chapterHover]);

  // Use useMemo to compute the scene map based on chapterText
  const sceneMap = useMemo(() => {
    if (!chapterHover || chapterText.length === 0) {
      return [];
    }

    const newSceneMap = [] as {
      name: string;
      number: number;
      lines: number[];
      explanation: string;
    }[];
    const chapterScenes = scene_data.filter(
      (scene: Scene) => scene.chapter === chapterHover
    );

    let cur_max_line = 0;
    chapterScenes.forEach((scene: Scene) => {
      if (cur_max_line + 1 < scene.firstLine) {
        newSceneMap.push({
          name: "filler",
          number: 0,
          lines: [cur_max_line + 1, scene.firstLine - 1],
          explanation: "",
        });
      }
      newSceneMap.push({
        name: scene.name,
        number: scene.number,
        lines: [scene.firstLine, scene.lastLine],
        explanation: scene.explanation || "",
      });
      cur_max_line = scene.lastLine;
    });

    if (cur_max_line < chapterText.length) {
      newSceneMap.push({
        name: "filler",
        number: 0,
        lines: [cur_max_line + 1, chapterText.length],
        explanation: "",
      });
    }

    return newSceneMap;
  }, [chapterHover, chapterText, scene_data]);

  useEffect(() => {
    if (curScrollScene && scrollSource) {
      const targetElement = document.querySelector(
        `.scene-text-group[data-scene-name="${curScrollScene}"]`
      );
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });

        // Reset scroll source after scrolling
        setTimeout(() => {
          setScrollSource(false);
        }, 300);
      }
    }
  }, [curScrollScene]);

  const calculateScrollPercentage = () => {
    const chapterTextElement = document.getElementById("chapter-text");
    if (chapterView || !chapterTextElement) return;

    const { scrollTop, scrollHeight, clientHeight } = chapterTextElement;

    // Calculate the percentage of scrolling (0 to 1)
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

    const elem = document.getElementById("story-contain");
    if (elem) {
      const newScrollX = elem.scrollWidth * scrollPercentage;

      // Update the store with the percentage
      setStoryScrollX(newScrollX);
    }
  };

  useEffect(() => {
    const chapterTextElement = document.getElementById("chapter-text");

    const handleScroll = () => {
      // Calculate and update the scroll percentage
      calculateScrollPercentage();
      setScrollSource(false); // Ensure manual scroll clears the programmatic flag
    };

    chapterTextElement?.addEventListener("scroll", handleScroll);
    // Calculate the scroll percentage on initial render

    setTimeout(() => {
      calculateScrollPercentage();
      setScrollSource(false); // Ensure manual scroll clears the programmatic flag
    }, 100);

    return () => {
      chapterTextElement?.removeEventListener("scroll", handleScroll);
    };
  }, [chapterView]);

  return (
    <div id="chapter-text">
      {sceneMap.map((scene, i) => {
        const firstLine = scene.lines[0];
        const lastLine = scene.lines[1];
        const sceneChapterText = chapterText.slice(firstLine - 1, lastLine);

        const scene_info = scene_data.find(
          (s: Scene) => s.chapter === chapterHover && s.name === scene.name
        );

        const location = scene_info?.location;
        const characters = scene_info?.characters;

        return (
          <div
            className="scene-text-group"
            key={i}
            data-scene-name={scene.name}
          >
            <div
              className={
                "scene-text " + (scene.name === "filler" ? "filler" : "")
              }
            >
              {sceneChapterText.map((line, j) => (
                <p className="text" key={j}>
                  <span className="line-num">{j + firstLine}</span>
                  {line}
                </p>
              ))}
            </div>

            <div
              className={
                "scene-info " + (scene.name === "filler" ? "filler" : "")
              }
            >
              <b>
                <span
                  className="scene-name"
                  onMouseEnter={() => setSceneHover(scene.name)}
                  onMouseLeave={() => setSceneHover("")}
                  onClick={() => {
                    if (!chapterView) {
                      // toggle verbose mode
                      setVerboseMode(!verboseMode);
                    }
                  }}
                >
                  {chapterView ? "" : `Scene ${scene.number}: `}
                  {chapterView && scene.name.length > 60
                    ? extractChapterName(scene.name)
                    : scene.name}
                </span>
                {!chapterView && scene.explanation !== "" && (
                  <InfoTooltip type="exp" label={scene.explanation} />
                )}
              </b>
              <p
                className="loc"
                onMouseEnter={() => setLocationHover(location as string)}
                onMouseLeave={() => setLocationHover("")}
              >
                {location}
              </p>
              {characters &&
                characters.map((char, i) => {
                  const name = char.name;
                  const rating = char.rating as number;
                  const importance = char.importance as number;
                  const group = sortedCharacters.find(
                    (c) => c.character === name
                  )?.group;
                  const charColor = getColor(name, sortedCharacters);
                  const llmColor =
                    getLLMColor(name, sortedCharacters) || charColor;
                  const groupColor = group
                    ? getGroupColor(group, uniqueGroups)
                    : charColor;
                  const sent_color = chroma(emotionColor(rating)).css();
                  const imp_color = chroma(importanceColor(importance)).css();

                  return (
                    <p
                      className="character"
                      key={i}
                      onMouseEnter={() => setCharacterHover(name)}
                      onMouseLeave={() => setCharacterHover("")}
                    >
                      <span
                        className="square"
                        style={{
                          backgroundColor:
                            characterColor === "llm"
                              ? llmColor
                              : characterColor === "group"
                              ? groupColor
                              : characterColor === "sentiment"
                              ? sent_color
                              : characterColor === "importance"
                              ? imp_color
                              : Object.keys(customColorDict).includes(
                                  characterColor
                                )
                              ? getCustomColor(
                                  customColorDict[characterColor],
                                  character_data,
                                  name,
                                  characterColor
                                )
                              : charColor,
                        }}
                      />
                      {name}
                    </p>
                  );
                })}

              <AskLLMPopover key={scene.name} sceneName={scene.name} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChapterText;
