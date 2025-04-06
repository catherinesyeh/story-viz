import { Button, Popover, Textarea } from "@mantine/core";
import { IoChatboxEllipses } from "react-icons/io5";
import { storyStore } from "../../stores/storyStore";
import { useState } from "react";
import { askLLMQuestion } from "../../server";
import { onlyLetters } from "../../utils/helpers";
import { dataStore } from "../../stores/dataStore";

function AskLLMPopover(props: any) {
  const { chapterView, modalLoading, setModalLoading, story, isBackendActive } =
    storyStore();
  const { scene_data } = dataStore();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const sceneName = props.sceneName;

  const askLLM = async () => {
    setModalLoading(true);
    setAnswer("");

    try {
      let chapterText;
      let textToSend;
      try {
        const story_formatted = onlyLetters(story.split("-")[0]);
        let chapter_formatted;

        if (chapterView) {
          chapter_formatted = sceneName.replace("?", "");
        } else {
          const scene = scene_data.find((scene) => scene.name === sceneName);
          chapter_formatted = scene?.chapter.replace("?", "");
        }

        const response = await fetch(
          `chapters/${story_formatted}/${chapter_formatted}.txt`
        );

        if (!response.ok) {
          throw new Error(`Failed to load chapter ${sceneName}`);
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

        chapterText = text;
      } catch (e) {
        console.error("Error loading chapter text:", e);
      }

      if (chapterView) {
        textToSend = chapterText;
      } else {
        // scene view
        // get scene text
        const scene = scene_data.find((scene) => scene.name === sceneName);
        const firstLine = scene?.firstLine;
        const lastLine = scene?.lastLine;
        const sceneText = chapterText
          ?.split("\n")
          .slice(firstLine && firstLine - 1, lastLine)
          .join("\n");
        textToSend = sceneText;
      }

      if (!textToSend) {
        console.error("Invalid text to send to LLM", textToSend);
      } else {
        const res = await askLLMQuestion(question, textToSend);
        if (res["answer"]) {
          const answer = res["answer"];
          setAnswer(answer);
        } else {
          setAnswer("No response from LLM");
        }
      }
    } catch (e) {
      console.error("Error asking LLM question:", e);
      setQuestion("Error");
    }

    setModalLoading(false);
  };

  return (
    <Popover width={320} position="bottom" withArrow>
      <Popover.Target>
        <Button
          className="ask-llm"
          size="compact-xs"
          variant="gradient"
          gradient={{ from: "#9c85c0", to: "#dd8047", deg: 0 }}
          leftSection={<IoChatboxEllipses />}
          disabled={!isBackendActive}
          title={isBackendActive ? "Ask LLM" : "Backend is not connected"}
        >
          ask about this {!chapterView ? "scene" : "chapter"}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Textarea
          className="ask-llm-textarea"
          size="xs"
          rows={2}
          value={question}
          onChange={(e) => {
            setQuestion(e.currentTarget.value);
          }}
          placeholder={`Enter your question here (e.g., why is Nick the most important character in this ${
            chapterView ? "chapter" : "scene"
          }?)`}
          spellCheck={false}
        />
        <Button
          fullWidth
          size="compact-xs"
          disabled={modalLoading || question.length === 0}
          onClick={askLLM}
        >
          <span className={modalLoading ? "loading" : ""}>
            {modalLoading ? "Loading..." : "Submit"}
          </span>
        </Button>
        <div
          style={{
            fontSize: "x-small",
            marginTop: "0.5rem",
            background: "#eee",
            borderRadius: "0.2rem",
            padding: "0.5rem",
          }}
          className={"ask-llm-answer" + (answer ? "" : " hidden")}
        >
          <b style={{ fontWeight: 500 }}>✨ Answer from LLM: </b>
          <span>{answer}</span>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export default AskLLMPopover;
