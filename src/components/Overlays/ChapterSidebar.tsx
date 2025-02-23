import { Button } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import SceneDivInner from "./SceneDivInner";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { dataStore } from "../../stores/dataStore";
import { useEffect } from "react";
import InfoTooltip from "../Misc/InfoTooltip";

function ChapterSidebar() {
  const { chapter_data } = dataStore();
  const {
    storyMarginTop,
    detailView,
    chapterHover,
    setChapterHover,
    setDetailView,
  } = storyStore();

  const isFirstChapter =
    chapter_data && chapter_data[0] && chapterHover === chapter_data[0].name;
  const isLastChapter =
    chapter_data &&
    chapter_data[chapter_data.length - 1] &&
    chapterHover === chapter_data[chapter_data.length - 1].name;

  const goToPrevChapter = () => {
    if (chapter_data) {
      const index = chapter_data.findIndex(
        (chapter) => chapter.name === chapterHover
      );
      if (index > 0) {
        const prevChapter = chapter_data[index - 1];
        setChapterHover(prevChapter.name);
      }
    }
  };

  const goToNextChapter = () => {
    if (chapter_data) {
      const index = chapter_data.findIndex(
        (chapter) => chapter.name === chapterHover
      );
      if (index < chapter_data.length - 1) {
        const nextChapter = chapter_data[index + 1];
        setChapterHover(nextChapter.name);
      }
    }
  };

  const closeDetailView = () => {
    setDetailView(false);
  };

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!detailView) return; // Only respond if detailView is open

      event.stopPropagation();
      event.preventDefault();

      switch (event.key) {
        case "Escape":
          closeDetailView();
          break;
        case "ArrowLeft":
          if (chapterHover !== "" && !isFirstChapter) goToPrevChapter();
          break;
        case "ArrowRight":
          if (chapterHover !== "" && !isLastChapter) goToNextChapter();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detailView, chapterHover, chapter_data]);

  return (
    <div
      id="chapter-sidebar"
      className={detailView ? "" : "hidden"}
      style={{ top: `calc(${storyMarginTop}px +  1rem)` }}
    >
      <div className="close">
        <Button
          size="xs compact"
          variant="transparent"
          onClick={closeDetailView}
          style={{ fontWeight: "400", fontFamily: "Shantell Sans" }}
        >
          [x] close detail view{" "}
          <InfoTooltip
            label={`keyboard controls: esc = exit, left/right arrow = prev/next chapter`}
          />
        </Button>
      </div>
      <div className="buttons">
        <Button
          size="xs"
          variant="transparent"
          disabled={chapterHover === "" || isFirstChapter}
          leftSection={<FaArrowLeftLong />}
          onClick={goToPrevChapter}
        >
          prev chapter
        </Button>
        <Button
          size="xs"
          variant="transparent"
          disabled={chapterHover === "" || isLastChapter}
          rightSection={<FaArrowRightLong />}
          onClick={goToNextChapter}
        >
          next chapter
        </Button>
      </div>
      <div id="scene-overlay">
        <SceneDivInner inSidebar={true} />
      </div>
    </div>
  );
}

export default ChapterSidebar;
