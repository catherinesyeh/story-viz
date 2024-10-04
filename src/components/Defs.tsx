import { storyStore } from "../stores/storyStore";
import {
  color_dict,
  emotionColor,
  conflictColor,
  importanceColor,
  getColor,
  getLLMColor,
  lengthColor,
} from "../utils/colors";
import { dataStore } from "../stores/dataStore";
import { RatingDict } from "../utils/data";
import { positionStore } from "../stores/positionStore";
import { scene_base } from "../utils/consts";

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
  return (
    <defs>
      <g id="gradients">
        {characterScenes.map((char, i) => {
          // get first and last scene indices for this character
          const charScenes = char.scenes;
          const first_scene = charScenes[0];
          const last_scene = charScenes[charScenes.length - 1];

          const activeCharScenes = charScenes.filter(
            (scene) => scene >= firstActiveScene && scene < lastActiveScene
          );

          const first_active_scene = activeCharScenes[0];
          const last_active_scene =
            activeCharScenes[activeCharScenes.length - 1];

          // compute fade in and fade out percentages
          const line_length =
            scenePos[last_scene] && scenePos[first_scene]
              ? scenePos[last_scene].x - scenePos[first_scene].x + sceneWidth
              : 0;
          const fade_in_buffer = scene_base / line_length / 2;
          const fade_in_buffer_percent = fade_in_buffer * 100;
          const fade_in =
            scenePos[first_active_scene] &&
            scenePos[first_scene] &&
            (scenePos[first_active_scene].x - scenePos[first_scene].x) /
              line_length +
              fade_in_buffer;
          const fade_in_percent = fade_in * 100;
          const fade_out =
            scenePos[last_scene] &&
            scenePos[last_active_scene] &&
            (scenePos[last_scene].x - scenePos[last_active_scene].x) /
              line_length +
              fade_in_buffer;
          const fade_out_percent = 100 - fade_out * 100;

          const charColor = getColor(char.character, sortedCharacters);
          const llmColor =
            getLLMColor(char.character, sortedCharacters) || charColor;

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
          return (
            <linearGradient
              id={"linear" + i}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              key={"linear" + i}
            >
              {activeCharScenes.length > 0 && (
                <>
                  <stop
                    offset={fade_in_percent - fade_in_buffer_percent + "%"}
                    stopColor={"rgb(255,255,255,0)"}
                  />
                  <stop
                    offset={fade_in_percent + "%"}
                    stopColor={
                      characterColor === "default"
                        ? charColor
                        : characterColor === "llm"
                        ? llmColor
                        : characterColor === "sentiment"
                        ? emotionColor(firstScene.rating)
                        : importanceColor(firstScene.importance)
                    }
                  />
                </>
              )}

              {activeCharScenes.flatMap((scene, j) => {
                const char_data = scene_data[scene].characters.find(
                  (c) => c.name === char.character
                ) as any;
                const emotion_val = char_data.rating;
                const importance_val = char_data.importance;
                const emotion_color = emotionColor(emotion_val); // dynamic color based on emotion
                const importance_color = importanceColor(importance_val); // dynamic color based on importance

                const next_scene = scene_data[activeCharScenes[j + 1]]
                  ? (scene_data[activeCharScenes[j + 1]].characters.find(
                      (c) => c.name === char.character
                    ) as any)
                  : char_data;
                const next_emotion_val = next_scene.rating;
                const next_emotion_color = emotionColor(next_emotion_val);
                const next_importance_val = next_scene.importance;
                const next_importance_color =
                  importanceColor(next_importance_val);

                const start_color =
                  characterColor === "default"
                    ? charColor
                    : characterColor === "llm"
                    ? llmColor
                    : characterColor === "sentiment"
                    ? emotion_color
                    : importance_color;
                const end_color =
                  characterColor === "default"
                    ? charColor
                    : characterColor === "llm"
                    ? llmColor
                    : characterColor === "sentiment"
                    ? next_emotion_color
                    : next_importance_color;

                if (j < activeCharScenes.length - 1) {
                  const next_scene = activeCharScenes[j + 1];
                  const start_gap =
                    scenePos[scene] && scenePos[first_scene]
                      ? (scenePos[scene].x -
                          scenePos[first_scene].x +
                          sceneWidth) /
                        line_length
                      : 0;
                  const end_gap =
                    scenePos[next_scene] && scenePos[first_scene]
                      ? (scenePos[next_scene].x - scenePos[first_scene].x) /
                        line_length
                      : 0;
                  const start_gap_percent = start_gap * 100;
                  const end_gap_percent = end_gap * 100;

                  if (next_scene - scene > 1) {
                    return [
                      <stop
                        key={`full-opacity-before-gap-${i}-${j}`}
                        offset={`${
                          start_gap_percent - fade_in_buffer_percent
                        }%`}
                        stopColor={start_color}
                      />,
                      <stop
                        key={`start-gap-${i}-${j}`}
                        offset={`${start_gap_percent}%`}
                        stopColor={start_color.replace(")", ",0.3)")}
                      />,
                      <stop
                        key={`mid-gap-${i}-${j}`}
                        offset={`${(start_gap_percent + end_gap_percent) / 2}%`}
                        stopColor={end_color.replace(")", ",0.1)")}
                      />,
                      <stop
                        key={`end-gap-${i}-${j}`}
                        offset={`${end_gap_percent}%`}
                        stopColor={end_color.replace(")", ",0.3)")}
                      />,
                      <stop
                        key={`full-opacity-after-gap-${i}-${j}`}
                        offset={`${end_gap_percent + fade_in_buffer_percent}%`}
                        stopColor={end_color}
                      />,
                    ];
                  } else {
                    // If there's no significant gap, directly return the stop with the emotion color
                    return [
                      <stop
                        key={`scene-${i}-${j}`}
                        offset={`${
                          start_gap_percent - fade_in_buffer_percent
                        }%`}
                        stopColor={start_color}
                      />,
                    ];
                  }
                }
                // For the last scene or if no next scene, ensure it doesn't return undefined
                return [];
              })}

              {activeCharScenes.length > 0 && (
                <>
                  <stop
                    offset={fade_out_percent + "%"}
                    stopColor={
                      characterColor === "default"
                        ? charColor
                        : characterColor === "llm"
                        ? llmColor
                        : characterColor === "sentiment"
                        ? emotionColor(lastScene.rating)
                        : importanceColor(lastScene.importance)
                    }
                  />
                  <stop
                    offset={fade_out_percent + fade_in_buffer_percent + "%"}
                    stopColor={"rgb(255,255,255,0)"}
                  />
                </>
              )}
            </linearGradient>
          );
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
                    stopColor={d3scale(val)}
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
                  stopColor={d3scale(val)}
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
                      firstScenePos.x
                    : 1;
                let percent =
                  activeScenePos[j] && firstScenePos
                    ? ((activeScenePos[j].x - firstScenePos.x) / denom) * 100
                    : 0;

                return (
                  <stop
                    offset={`${percent}%`}
                    stopColor={
                      rating_type === "sentiment"
                        ? emotionColor(rating)
                        : rating_type === "conflict"
                        ? conflictColor(rating)
                        : rating_type === "importance"
                        ? importanceColor(rating)
                        : lengthColor(rating)
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
