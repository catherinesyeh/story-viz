import { storyStore } from "../stores/store";
import {
  colors,
  color_dict,
  emotionColor,
  conflictColor,
  importanceColor,
} from "../utils/colors";
import { scene_width } from "../utils/consts";
import { characterScenes, ratingDict, scenes } from "../utils/data";
import { normalizeRating } from "../utils/helpers";
import { scenePos } from "../utils/positions";

function Defs() {
  const { sceneHover } = storyStore();
  return (
    <defs>
      <g id="gradients">
        {characterScenes.map((char, i) => {
          // get first and last scene indices for this character
          const charScenes = char.scenes;
          const first_scene = charScenes[0];
          const last_scene = charScenes[charScenes.length - 1];
          const range = last_scene - first_scene + 1;

          // compute fade in and fade out percentages
          const line_length = scene_width * range;
          const fade_in = scene_width / line_length / 2;
          const fade_in_percent = fade_in * 100;
          const fade_out_percent = 100 - fade_in_percent;

          return (
            <linearGradient
              id={"linear" + i}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              key={"linear" + i}
            >
              <stop offset="0%" stopColor="rgb(255,255,255,0)" />
              <stop offset={fade_in_percent + "%"} stopColor={colors[i]} />

              {charScenes
                .filter((_, j) => j < charScenes.length - 1)
                .flatMap((scene, j) => {
                  const next_scene = charScenes[j + 1];
                  if (next_scene - scene > 2) {
                    const start_gap =
                      ((scene - first_scene + 1) * scene_width) / line_length;
                    const end_gap =
                      ((next_scene - first_scene) * scene_width) / line_length;
                    const start_gap_percent = start_gap * 100;
                    const end_gap_percent = end_gap * 100;
                    return [
                      // Maintain full opacity up to the gap
                      <stop
                        key={`full-opacity-before-gap-${i}-${j}`}
                        offset={`${start_gap_percent - fade_in_percent}%`}
                        stopColor={colors[i]}
                      />,
                      // Start fading to transparent just before the gap
                      <stop
                        key={`start-gap-${i}-${j}`}
                        offset={`${start_gap_percent}%`}
                        stopColor={colors[i].replace("1)", "0.5)")}
                      />,
                      // Fully transparent in the middle of the gap
                      <stop
                        key={`mid-gap-${i}-${j}`}
                        offset={`${(start_gap_percent + end_gap_percent) / 2}%`}
                        stopColor={colors[i].replace("1)", "0.2)")}
                      />,
                      // Start fading back to full opacity just before the end of the gap
                      <stop
                        key={`end-gap-${i}-${j}`}
                        offset={`${end_gap_percent}%`}
                        stopColor={colors[i].replace("1)", "0.5)")}
                      />,
                      // Return to full opacity after the gap
                      <stop
                        key={`full-opacity-after-gap-${i}-${j}`}
                        offset={`${end_gap_percent + fade_in_percent}%`}
                        stopColor={colors[i]}
                      />,
                    ];
                  }
                  // For consecutive scenes with no gap, simply return an empty array
                  return [];
                })}

              <stop offset={fade_out_percent + "%"} stopColor={colors[i]} />
              <stop offset="100%" stopColor="rgb(255,255,255,0)" />
            </linearGradient>
          );
        })}
        {Object.keys(color_dict).map((scale, _) => {
          const color_incs = (color_dict as Record<string, number[]>)[scale];
          const d3scale =
            scale === "emotion"
              ? emotionColor
              : scale === "conflict"
              ? conflictColor
              : importanceColor;
          const min_val = color_incs[0];
          const max_val = color_incs[color_incs.length - 1];
          const vals = color_incs.map(
            (val) => ((val - min_val) / (max_val - min_val)) * 100
          );
          return (
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
        })}
        {/* create gradient for each set of ratings */}
        {Object.keys(ratingDict).map((rating_type: any) => (
          <linearGradient
            id={"rating" + rating_type}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            key={"rating gradient" + rating_type}
          >
            {ratingDict[rating_type].map((rating: number, j: number) => {
              const last_ind = ratingDict[rating_type].length - 1;
              let percent = (j / last_ind) * 100;
              return (
                <stop
                  offset={`${percent}%`}
                  stopColor={
                    rating_type === "emotion"
                      ? emotionColor(rating)
                      : rating_type === "conflict"
                      ? conflictColor(normalizeRating(rating))
                      : importanceColor(rating)
                  }
                  key={"rating stop" + rating_type + j}
                />
              );
            })}
          </linearGradient>
        ))}
        {/* white gradient for overlay */}
        <linearGradient id="white-gradient" x1="0" y1="0%" x2="100%" y2="0%">
          <stop
            offset={
              sceneHover === ""
                ? "90%"
                : 100 -
                  (scene_width / scenePos[scenes.indexOf(sceneHover)].x) * 100 +
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
                  (scene_width /
                    ((scenes.length - scenes.indexOf(sceneHover) - 1) *
                      scene_width)) *
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

      <filter id="blur">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>
  );
}

export default Defs;
