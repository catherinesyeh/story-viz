import { Button, Popover, Textarea } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import { useEffect, useState } from "react";
import { findChapterWithLLM } from "../../server";
import { dataStore } from "../../stores/dataStore";
import { chapterFormatted, extractChapterName } from "../../utils/helpers";

function FindChapterPopover() {
  const {
    modalLoading,
    setModalLoading,
    isBackendActive,
    chapterHover,
    detailView,
    setDetailView,
    setChapterHover,
    story,
    demoMode,
  } = storyStore();
  const { chapter_data } = dataStore();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chapter, setChapter] = useState("");

  const findChapter = async () => {
    setModalLoading(true);
    setAnswer("");
    setChapter("");

    try {
      // Convert chapter data to text
      const textToSend = JSON.stringify(chapter_data);
      if (!textToSend) {
        console.error("Invalid text to send to LLM", textToSend);
      } else {
        const res = await findChapterWithLLM(question, textToSend);
        if (res["chapter"]) {
          const chapter = res["chapter"];
          if (chapter === "N/A") {
            setChapter("");
          } else {
            setChapter(chapter);
          }
          const answer = res["explanation"];
          setAnswer(answer);
        } else {
          setChapter("");
          setAnswer("No chapter found.");
        }
      }
    } catch (e) {
      console.error("Error asking LLM question:", e);
      setQuestion("Error");
    }

    setModalLoading(false);
  };

  const changeChapterHover = () => {
    if (chapter === "") return;
    if (!detailView) {
      setDetailView(true);
    }
    if (chapter !== chapterHover) {
      setChapterHover(chapter);
    }
  };

  useEffect(() => {
    setQuestion("");
    setChapter("");
    setAnswer("");
  }, [story]);

  return (
    <Popover width={400} position="bottom" withArrow>
      <Popover.Target>
        <Button
          className="find-chapter"
          style={{ marginBottom: demoMode ? "1rem" : "" }}
          size="xs"
          variant="gradient"
          gradient={{ from: "#9c85c0", to: "#dd8047", deg: 0 }}
          disabled={!isBackendActive}
          title={isBackendActive ? "Find chapter" : "Backend is not connected"}
        >
          Ask a question to start exploring
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Textarea
          className="find-chapter-textarea"
          size="xs"
          rows={2}
          value={question}
          onChange={(e) => {
            setQuestion(e.currentTarget.value);
          }}
          placeholder={`Enter your question here (e.g., When does Nick first meet Jordan?)`}
          spellCheck={false}
        />
        <Button
          fullWidth
          className="find-chapter-button"
          size="compact-xs"
          disabled={modalLoading || question.length === 0}
          onClick={findChapter}
        >
          <span className={modalLoading ? "loading" : ""}>
            {modalLoading ? "Loading..." : "Submit"}
          </span>
        </Button>
        <div
          style={{
            fontSize: "10px",
            marginTop: "0.5rem",
            background: "#eee",
            borderRadius: "0.2rem",
            padding: "0.5rem",
          }}
          className={"find-chapter-answer" + (answer ? "" : " hidden")}
        >
          <b style={{ fontWeight: 500 }}>✨ Answer from LLM: </b>
          <span>{answer}</span>
        </div>
        <Button
          className={"find-chapter-button " + (chapter ? "" : "hidden")}
          size="compact-xs"
          variant="transparent"
          style={{ float: "right" }}
          onClick={changeChapterHover}
        >
          Go to{" "}
          {chapterFormatted(chapter)
            ? chapter.length > 60
              ? extractChapterName(chapter)
              : chapter
            : "Chapter " + chapter}
          {" >"}
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
}

export default FindChapterPopover;
