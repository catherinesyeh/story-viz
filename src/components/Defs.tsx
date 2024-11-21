import { storyStore } from "../stores/storyStore";
import {
  color_dict,
  emotionColor,
  conflictColor,
  importanceColor,
  getColor,
  getLLMColor,
  lengthColor,
  getGroupColor,
} from "../utils/colors";
import { dataStore } from "../stores/dataStore";
import { RatingDict } from "../utils/data";
import { positionStore } from "../stores/positionStore";
import { character_offset } from "../utils/consts";
import chroma from "chroma-js";

function Defs() {
  const { sceneHover, characterColor } = storyStore();
  const { scenePos, sceneWidth } = positionStore();
  const {
    characterScenes,
    ratingDict,
    scenes,
    sortedCharacters,
    scene_data,
    chapterDivisions,
    activeChapters,
  } = dataStore();

  // active chapters
  const activeChapterDivisions =
    chapterDivisions &&
    chapterDivisions.filter((_, i) => {
      return i >= activeChapters[0] - 1 && i < activeChapters[1];
    });
  const firstActiveChapter = activeChapterDivisions[0];
  const firstActiveScene = firstActiveChapter && firstActiveChapter.index;
  const lastActiveChapter =
    activeChapterDivisions[activeChapterDivisions.length - 1];
  const lastActiveScene =
    lastActiveChapter &&
    lastActiveChapter.index + lastActiveChapter.scenes.length;
  const numScenesInLastActiveChapter =
    lastActiveChapter &&
    lastActiveChapter.scenes &&
    lastActiveChapter.scenes.length;
  const activeScenePos =
    scenePos &&
    scenePos.slice(
      activeChapterDivisions[0].index,
      activeChapterDivisions[activeChapterDivisions.length - 1].index +
        numScenesInLastActiveChapter
    );

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  return (
    <defs>
      <g id="gradients">
        {characterScenes.map((char, i) => {
          const charScenes = char.scenes;
          const group = sortedCharacters.find(
            (c) => c.character === char.character
          )?.group;
          const og_segments = [] as number[][];
          let og_cur_seg = [] as number[];
          // Create segments for each continuous set of scenes
          charScenes.forEach((scene, j) => {
            og_cur_seg.push(scene);
            const next_scene = charScenes[j + 1];

            if (next_scene - scene > 1 || next_scene === undefined) {
              og_segments.push(og_cur_seg);
              og_cur_seg = [];
            }
          });

          const segments = og_segments.map((seg) =>
            seg.filter(
              (scene) => scene >= firstActiveScene && scene < lastActiveScene
            )
          );

          // Generate gradients for each segment
          return segments.map((segment, segIndex) => {
            if (segment.length === 0) {
              return null;
            }
            const og_segment = og_segments[segIndex];
            const first_scene = segment[0];
            const last_scene = segment[segment.length - 1];
            const og_first_scene = og_segment[0];
            const og_last_scene = og_segment[og_segment.length - 1];
            const line_length =
              scenePos[og_last_scene] && scenePos[og_first_scene]
                ? scenePos[og_last_scene].x -
                  scenePos[og_first_scene].x +
                  (sceneWidth / 3) * 2
                : 0;
            const fade_in_buffer = sceneWidth / line_length / 3;
            const fade_in_buffer_percent = fade_in_buffer * 100;

            const start_gap =
              scenePos[first_scene] && scenePos[og_first_scene]
                ? (scenePos[first_scene].x - scenePos[og_first_scene].x) /
                    line_length +
                  fade_in_buffer
                : 0;
            const fade_in_percent = start_gap * 100;

            const end_gap =
              scenePos[last_scene] && scenePos[og_last_scene]
                ? (scenePos[og_last_scene].x - scenePos[last_scene].x) /
                    line_length +
                  fade_in_buffer
                : 0;
            const end_gap_percent = end_gap * 100;
            const fade_out_percent = 100 - end_gap_percent;

            const charColor = getColor(char.character, sortedCharacters);
            const llmColor =
              getLLMColor(char.character, sortedCharacters) || charColor;
            const groupColor = group
              ? getGroupColor(group, uniqueGroups)
              : charColor;

            const firstScene =
              scene_data[first_scene] &&
              (scene_data[first_scene].characters.find(
                (c) => c.name === char.character
              ) as any);
            const lastScene =
              scene_data[last_scene] &&
              (scene_data[last_scene].characters.find(
                (c) => c.name === char.character
              ) as any);

            const emotion_val = firstScene.rating as number;
            const importance_val = firstScene.importance as number;
            const emotion_color = chroma(emotionColor(emotion_val)).css();
            const importance_color = chroma(
              importanceColor(importance_val)
            ).css();

            const emotion_val2 = lastScene.rating as number;
            const importance_val2 = lastScene.importance as number;
            const emotion_color2 = chroma(emotionColor(emotion_val2)).css();
            const importance_color2 = chroma(
              importanceColor(importance_val2)
            ).css();

            const start_color =
              characterColor === "default"
                ? charColor
                : characterColor === "llm"
                ? llmColor
                : characterColor === "group"
                ? groupColor
                : characterColor === "sentiment"
                ? emotion_color
                : importance_color;
            const end_color =
              characterColor === "default"
                ? charColor
                : characterColor === "llm"
                ? llmColor
                : characterColor === "group"
                ? groupColor
                : characterColor === "sentiment"
                ? emotion_color2
                : importance_color2;

            return (
              <linearGradient
                id={`linear-${i}-${segIndex}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
                key={`linear-${i}-${segIndex}`}
              >
                {segment.length > 0 && (
                  <>
                    <stop
                      offset={fade_in_percent - fade_in_buffer_percent + "%"}
                      stopColor={
                        segIndex === 0 && og_first_scene === first_scene
                          ? start_color
                          : "rgb(255,255,255, 1)"
                      }
                    />
                    <stop
                      offset={fade_in_percent + "%"}
                      stopColor={start_color}
                    />
                  </>
                )}
                {segment.flatMap((scene, j) => {
                  const char_data = scene_data[scene].characters.find(
                    (c) => c.name === char.character
                  ) as any;
                  const emotion_val = char_data.rating as number;
                  const importance_val = char_data.importance as number;
                  const seg_emotion_color = chroma(
                    emotionColor(emotion_val)
                  ).css();
                  const seg_importance_color = chroma(
                    importanceColor(importance_val)
                  ).css();

                  const start_color =
                    characterColor === "default"
                      ? charColor
                      : characterColor === "llm"
                      ? llmColor
                      : characterColor === "group"
                      ? groupColor
                      : characterColor === "sentiment"
                      ? seg_emotion_color
                      : seg_importance_color;

                  const start_gap =
                    scenePos[scene] && scenePos[first_scene]
                      ? (scenePos[scene].x -
                          scenePos[og_first_scene].x +
                          0.75 * sceneWidth) /
                        line_length
                      : 0;
                  const start_gap_percent = start_gap * 100;

                  return [
                    <stop
                      key={`segment-stop-start-${i}-${j}`}
                      offset={`${start_gap_percent - fade_in_buffer_percent}%`}
                      stopColor={start_color}
                    />,
                  ];
                })}
                {segment.length > 0 && (
                  <>
                    <stop
                      offset={fade_out_percent + "%"}
                      stopColor={end_color}
                    />
                    <stop
                      offset={fade_out_percent + fade_in_buffer_percent + "%"}
                      stopColor={
                        segIndex === segments.length - 1 &&
                        og_last_scene === last_scene
                          ? end_color
                          : "rgb(255,255,255,1)"
                      }
                    />
                  </>
                )}
              </linearGradient>
            );
          });
        })}
        {Object.keys(color_dict).map((scale, _) => {
          const color_incs = (color_dict as Record<string, number[]>)[scale];
          const d3scale =
            scale === "sentiment"
              ? emotionColor
              : scale === "conflict"
              ? conflictColor
              : scale === "importance"
              ? importanceColor
              : lengthColor;
          const min_val = color_incs[0];
          const max_val = color_incs[color_incs.length - 1];
          const vals = color_incs.map(
            (val) => ((val - min_val) / (max_val - min_val)) * 100
          );
          let vertical_scale;
          if (scale === "sentiment" || scale === "importance") {
            vertical_scale = (
              <linearGradient
                id={"vert-legend" + scale}
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
                key={"vert-legend" + scale}
              >
                {color_incs.map((val, j) => (
                  <stop
                    offset={`${vals[j]}%`}
                    stopColor={chroma(d3scale(val)).css()}
                    key={"vert-legend stop" + scale + j}
                  />
                ))}
              </linearGradient>
            );
          }
          const horizontal_scale = (
            <linearGradient
              id={"legend" + scale}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              key={"legend" + scale}
            >
              {color_incs.map((val, j) => (
                <stop
                  offset={`${vals[j]}%`}
                  stopColor={chroma(d3scale(val)).css()}
                  key={"legend stop" + scale + j}
                />
              ))}
            </linearGradient>
          );
          return vertical_scale
            ? [vertical_scale, horizontal_scale]
            : [horizontal_scale];
        })}
        {/* create gradient for each set of ratings */}
        {Object.keys(ratingDict).map((rating_type) => {
          const curDict = ratingDict[rating_type as keyof RatingDict];
          const activeRatings = curDict.slice(
            activeChapterDivisions[0].index,
            activeChapterDivisions[activeChapterDivisions.length - 1].index +
              numScenesInLastActiveChapter
          );
          return (
            <linearGradient
              id={"rating" + rating_type}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              key={"rating gradient" + rating_type}
            >
              {activeRatings.map((rating, j) => {
                const firstScenePos = scenePos[firstActiveScene];
                const denom =
                  activeScenePos[activeScenePos.length - 1] && firstScenePos
                    ? activeScenePos[activeScenePos.length - 1].x -
                      firstScenePos.x +
                      2.5 * character_offset
                    : 1;
                let percent =
                  activeScenePos[j] && firstScenePos
                    ? ((activeScenePos[j].x -
                        firstScenePos.x +
                        1.25 * character_offset) /
                        denom) *
                      100
                    : 0;

                return (
                  <stop
                    offset={`${percent}%`}
                    stopColor={
                      rating_type === "sentiment"
                        ? chroma(emotionColor(rating)).css()
                        : rating_type === "conflict"
                        ? chroma(conflictColor(rating)).css()
                        : rating_type === "importance"
                        ? chroma(importanceColor(rating)).css()
                        : chroma(lengthColor(rating)).css()
                    }
                    key={"rating stop" + rating_type + j}
                  />
                );
              })}
            </linearGradient>
          );
        })}
        {/* white gradient for overlay */}
        <linearGradient id="white-gradient" x1="0" y1="0%" x2="100%" y2="0%">
          <stop
            offset={
              sceneHover === "" || !scenePos[scenes.indexOf(sceneHover)]
                ? "90%"
                : 100 -
                  (sceneWidth / scenePos[scenes.indexOf(sceneHover)].x) * 100 +
                  "%"
            }
            stopColor="white"
          />
          <stop offset="100%" stopColor="rgb(255,255,255,0)" />
        </linearGradient>
        <linearGradient
          id="white-gradient-right"
          x1="100%"
          y1="0%"
          x2="0%"
          y2="0%"
        >
          <stop
            offset={
              sceneHover === ""
                ? "90%"
                : 100 -
                  (sceneWidth /
                    ((scenes.length - scenes.indexOf(sceneHover) - 1) *
                      sceneWidth)) *
                    100 +
                  "%"
            }
            stopColor="white"
          />
          <stop offset="100%" stopColor="rgb(255,255,255,0)" />
        </linearGradient>
      </g>

      {/* adapted from: https://jsfiddle.net/jxtfeqag/ */}
      <marker
        id="head"
        orient="auto"
        markerWidth="6"
        markerHeight="6"
        refX="0.1"
        refY="3"
      >
        <path d="M0,0 V6 L4.5,3 Z" fill="#000000" />
      </marker>
    </defs>
  );
}

export default Defs;
