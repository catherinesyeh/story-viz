import { Button } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import SceneDivInner from "./SceneDivInner";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

function ChapterSidebar() {
  const { storyMarginTop, detailView, chapterHover } = storyStore();
  return (
    <div
      id="chapter-sidebar"
      className={detailView ? "" : "hidden"}
      style={{ top: `calc(${storyMarginTop}px +  1rem)` }}
    >
      <div className="buttons">
        <Button
          size="xs"
          variant="transparent"
          disabled={chapterHover === ""}
          leftSection={<FaArrowLeftLong />}
        >
          prev chapter
        </Button>
        <Button
          size="xs"
          variant="transparent"
          disabled={chapterHover === ""}
          rightSection={<FaArrowRightLong />}
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
