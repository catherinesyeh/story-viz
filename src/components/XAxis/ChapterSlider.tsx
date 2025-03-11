import { Button, RangeSlider } from "@mantine/core";
import { dataStore } from "../../stores/dataStore";
import { extractChapterName } from "../../utils/helpers";
import InfoTooltip from "../Misc/InfoTooltip";
import FindChapterPopover from "../Modals/FindChapterPopover";

function ChapterSlider() {
  const {
    num_chapters,
    activeChapters,
    setActiveChapters,
    resetActiveChapters,
    chapterDivisions,
  } = dataStore();

  let first_chapter =
    chapterDivisions && chapterDivisions[0] ? chapterDivisions[0].chapter : "";
  first_chapter = extractChapterName(first_chapter);
  let last_chapter =
    chapterDivisions && chapterDivisions[chapterDivisions.length - 1]
      ? chapterDivisions[chapterDivisions.length - 1].chapter
      : "";
  last_chapter = extractChapterName(last_chapter);
  const maxChars = 20;

  // Function to get chapter name by index
  const getChapterName = (value: number) => {
    if (!chapterDivisions || value < 1 || value > chapterDivisions.length) {
      return "";
    }
    const chapter = chapterDivisions[value - 1].chapter;
    const chapterName = extractChapterName(chapter);
    return chapterName && chapterName.length > maxChars
      ? chapterName.slice(0, maxChars) + "..."
      : chapterName;
  };

  return (
    <div
      id="slider-outer"
      className={first_chapter && last_chapter ? "" : "hidden"}
    >
      <FindChapterPopover />
      <div
        id="chapter-slider"
        className={first_chapter && last_chapter ? "" : "hidden"}
      >
        <span className="label">
          Filter by chapter
          <InfoTooltip label="drag slider to filter plot by chapters" />
        </span>
        {/* <b>filter by chapter:</b> */}
        <span>
          {first_chapter && first_chapter.length > maxChars
            ? first_chapter.slice(0, maxChars) + "..."
            : first_chapter}
        </span>
        <RangeSlider
          min={1}
          max={num_chapters}
          minRange={0}
          value={activeChapters}
          onChange={setActiveChapters}
          size={"sm"}
          label={(value) => getChapterName(value)} // Display chapter names on hover
        />
        <span>
          {last_chapter && last_chapter.length > maxChars
            ? last_chapter.slice(0, maxChars) + "..."
            : last_chapter}
        </span>
        <Button size="xs" onClick={() => resetActiveChapters(num_chapters)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
export default ChapterSlider;
