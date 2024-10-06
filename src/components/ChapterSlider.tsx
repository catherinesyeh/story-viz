import { Button, RangeSlider } from "@mantine/core";
import { dataStore } from "../stores/dataStore";

function ChapterSlider() {
  const {
    num_chapters,
    activeChapters,
    setActiveChapters,
    resetActiveChapters,
    chapterDivisions,
  } = dataStore();
  const first_chapter = chapterDivisions ? chapterDivisions[0].chapter : "";
  const last_chapter = chapterDivisions
    ? chapterDivisions[chapterDivisions.length - 1].chapter
    : "";
  return (
    <div
      id="chapter-slider"
      className={first_chapter && last_chapter ? "" : "hidden"}
    >
      <b>filter by chapter:</b>
      <span>{first_chapter}</span>
      <RangeSlider
        min={1}
        max={num_chapters}
        minRange={0}
        value={activeChapters}
        onChange={setActiveChapters}
        size={"sm"}
      />
      <span>{last_chapter}</span>
      <Button size="xs" onClick={resetActiveChapters}>
        Reset
      </Button>
    </div>
  );
}
export default ChapterSlider;
