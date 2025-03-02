import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { storyStore } from "../../stores/storyStore";
import { dataStore } from "../../stores/dataStore";
import { normalize } from "../../utils/helpers";
import {
  emotionColor,
  getColor,
  getGroupColor,
  getLLMColor,
  importanceColor,
  getCustomColor,
} from "../../utils/colors";
import chroma from "chroma-js";
import { CharacterLink, Scene } from "../../utils/data";
import { Button } from "@mantine/core";

type Node = {
  id: string;
  group: string;
  emotion: number;
  importance: number;
  numScenes: number;
  x?: number;
  y?: number;
};

type Link = {
  source: Node;
  target: Node;
  interaction: string;
  lighter: boolean;
  value: number;
};

function CharacterNetwork(props: any) {
  const {
    sceneHover,
    characterColor,
    chapterHover,
    detailView,
    chapterView,
    setCharacterHover,
    setLinkHover,
    cumulativeMode,
    linkHover,
    characterHover,
    setNetworkHover,
  } = storyStore();
  const {
    scene_data,
    character_data,
    sortedCharacters,
    chapter_data,
    customColorDict,
  } = dataStore();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null); // Store zoom behavior

  const def_margin = 10;
  const char_width = 6;
  const inSidebar = props.inSidebar || false;

  let cur_scene: Scene | undefined;
  let prevScenes: Scene[] = [];
  if (
    inSidebar &&
    detailView &&
    (!chapterView || sceneHover === "") &&
    chapterHover !== ""
  ) {
    cur_scene = chapter_data.find((d) => d.name === chapterHover);
    if (cur_scene) {
      prevScenes = chapter_data.slice(0, chapter_data.indexOf(cur_scene));
    }
  } else {
    cur_scene = scene_data.find((d) => d.name === sceneHover);
    if (cur_scene) {
      prevScenes = scene_data.slice(0, scene_data.indexOf(cur_scene));
    }
  }

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  const getNodeColor = (
    c_name: string,
    emotion_val: number,
    importance_val: number
  ) => {
    const c_data = character_data.find((c) => c.character === c_name);
    const group = c_data?.group;

    const charColor = getColor(c_name, sortedCharacters);
    const llmColor = getLLMColor(c_name, sortedCharacters) || charColor;
    const groupColor = group ? getGroupColor(group, uniqueGroups) : charColor;
    const emotion_color = chroma(emotionColor(emotion_val as number)).css();
    const importance_color = chroma(
      importanceColor(importance_val as number)
    ).css();

    const color =
      characterColor === "llm"
        ? llmColor
        : characterColor === "group"
        ? groupColor
        : characterColor === "sentiment"
        ? emotion_color
        : characterColor === "importance"
        ? importance_color
        : Object.keys(customColorDict).includes(characterColor)
        ? getCustomColor(
            customColorDict[characterColor],
            character_data,
            c_name,
            characterColor
          )
        : charColor;
    return color;
  };

  useEffect(() => {
    if (!cur_scene) return;

    let scene_characters = [...(cur_scene?.characters || [])];

    let og_links = [...(cur_scene?.links || [])];

    if (inSidebar && cumulativeMode) {
      // get all characters in the story up to this point
      // const prevScenes = chapter_data.slice(0, chapter_data.indexOf(cur_scene));

      let prevChars = [
        ...prevScenes.flatMap((s) => s.characters.map((c) => ({ ...c }))),
      ];

      // only keep one instance of each character in prevChars
      const seen = new Set();
      const curCharNames = scene_characters.map((s) => s.name);
      let newChars = prevChars.filter((c) => {
        if (seen.has(c.name)) {
          return false;
        }
        seen.add(c.name);
        return !curCharNames.includes(c.name);
      });
      newChars = newChars.map((c) => ({
        ...c,
        // set importance to 0 for characters that are not in the current scene
        importance: 0,
      }));

      scene_characters = [...scene_characters, ...newChars];

      // get all links in the story up to this point
      const prevLinks = prevScenes
        ? prevScenes.flatMap((s) =>
            s.links ? (s.links as CharacterLink[]).map((l) => ({ ...l })) : []
          )
        : [];

      if (prevLinks && prevLinks.length > 0) {
        // add in links, combining links that have the same source and target (or target and source)
        prevLinks.forEach((l) => {
          const source = l.source;
          const target = l.target;
          const value = l.value;

          const existingLink = og_links.find(
            (link) =>
              (link.source === source && link.target === target) ||
              (link.source === target && link.target === source)
          );

          if (existingLink) {
            existingLink.value += value;
          } else {
            og_links = [...og_links, l];
          }
        });
      }
    }

    const nodes = scene_characters.map((d) => {
      const s_data = d;
      const emotion_val = s_data?.rating || 0;
      const importance_val = s_data?.importance || 0;
      const numScenes = s_data?.numScenes || 0;

      return {
        id: d.name,
        group: d.group,
        emotion: emotion_val,
        importance: importance_val,
        numScenes: numScenes,
      };
    }) as Node[];

    const links = og_links
      .filter(
        (l) =>
          scene_characters.some((c) => c.name === l.source) &&
          scene_characters.some((c) => c.name === l.target)
      )
      .map((d) => {
        if (
          !nodes.find((n) => n.id === d.source) ||
          !nodes.find((n) => n.id === d.target)
        ) {
          console.error("Link references a non-existent node", d);
        }
        return {
          source: nodes.find((n) => n.id === d.source),
          target: nodes.find((n) => n.id === d.target),
          interaction: d.interaction,
          lighter:
            nodes.find((n) => n.id === d.source)?.importance === 0 ||
            nodes.find((n) => n.id === d.target)?.importance === 0,
          value: d.value,
        };
      }) as Link[];

    if (nodes.length === 0) return;

    const min_val = d3.min(links, (d) => d.value) || 0;
    const max_val = d3.max(links, (d) => d.value) || 1;
    let min_importance = d3.min(nodes, (d) => d.importance) || 0;
    min_importance = min_importance === 1 ? 0 : min_importance;

    const svgElement = svgRef.current;
    if (!svgElement) return;

    const parentElement = svgElement.parentElement;
    if (!parentElement) return;

    const width = parentElement.offsetWidth;
    const height = 300;
    const margin = def_margin;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // Add a group element to handle zooming and panning
    const zoomLayer = svg.append("g").attr("class", "zoom-layer");

    const simulation = d3
      .forceSimulation(nodes as Node[])
      .force(
        "link",
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .strength(0.1)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        // Find the min and max x/y values after the simulation tick
        const xExtent = d3.extent(nodes, (d) => d.x || 0) as [number, number];
        const yExtent = d3.extent(nodes, (d) => d.y || 0) as [number, number];

        // Normalize x and y coordinates to fit the SVG dimensions
        nodes.forEach((node) => {
          node.x = normalize(
            node.x || 0,
            xExtent[0],
            xExtent[1],
            margin,
            width - margin
          );
          if (Number.isNaN(node.x)) {
            node.x = width / 2;
          }
          node.y = normalize(
            node.y || 0,
            yExtent[0],
            yExtent[1],
            margin,
            height - margin
          );
          if (Number.isNaN(node.y)) {
            node.y = height / 2;
          }
        });

        // Update positions
        link
          .attr("x1", (d) => (d.source as Node).x || 0)
          .attr("y1", (d) => (d.source as Node).y || 0)
          .attr("x2", (d) => (d.target as Node).x || 0)
          .attr("y2", (d) => (d.target as Node).y || 0);

        node.attr("cx", (d) => d.x as number).attr("cy", (d) => d.y as number);

        label
          .attr("x", (d) => {
            const x = d.x as number;
            const size = char_width;
            const extra_buffer = normalize(
              d.importance,
              min_importance,
              1,
              6,
              10
            );
            if (x + size * d.id.length > width - margin)
              return x - margin - extra_buffer; // Too close to the right edge, shift left
            return x; // Default offset
          })
          .attr("y", (d) => {
            const y = d.y as number;
            return y; // Default position
          })
          .attr("text-anchor", (d) => {
            const x = d.x as number;
            const size = char_width;
            if (x + size * d.id.length > width - margin) return "end"; // Align text to the left if shifted
            if (x - size * d.id.length < margin) return "start"; // Align text to the right if shifted
            return "start"; // Default alignment
          });
      });

    const link = zoomLayer
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ddd")
      .attr("stroke-width", (d) => normalize(d.value, min_val, max_val, 1, 8))
      .attr("stroke-opacity", (d) => (d.lighter ? 0.2 : 0.75))
      // add hover behavior
      .on("mouseover", (_, d) => {
        if (
          !d.source ||
          !d.target ||
          d.source.importance === 0 ||
          d.target.importance === 0
        )
          return;
        setLinkHover([d.source.id, d.target.id]); // Update linkHover with the link's source and target
        setNetworkHover(
          `<p><b>${d.source.id}</b> and <b>${d.target.id}</b> appear <b>${
            d.value
          }</b> time${d.value === 1 ? "" : "s"} together in this chapter</p>${
            d.interaction ? `<p class='desc'>➡️ ${d.interaction}</p>` : ""
          }`
        );
      })
      .on("mouseout", () => {
        setLinkHover([]); // Clear linkHover when not hovering
        setNetworkHover("");
      });
    const node = zoomLayer
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => normalize(d.importance, min_importance, 1, 2, 8))
      .attr("fill", (d) => getNodeColor(d.id, d.emotion, d.importance))
      .attr("fill-opacity", (d) => (d.importance === 0 ? 0.25 : 1))
      .on("mouseover", (_, d) => {
        if (d.importance === 0) return;
        setCharacterHover(d.id); // Update characterHover with the character's name
        setNetworkHover(
          `<b>${d.id}</b> appears <b>${d.numScenes}</b> time${
            d.numScenes === 1 ? "" : "s"
          } in this chapter`
        );
      })
      .on("mouseout", () => {
        setCharacterHover(""); // Clear characterHover when not hovering
        setNetworkHover("");
      });

    const label = zoomLayer
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.id)
      .attr("font-size", (d) =>
        normalize(d.importance, min_importance, 1, 6, 10)
      )
      .attr("dx", (d) => normalize(d.importance, min_importance, 1, 6, 10))
      .attr("dy", ".35em")
      .attr("fill-opacity", (d) => (d.importance === 0 ? 0.25 : 1))
      // Add hover behavior
      .on("mouseover", (_, d) => {
        if (d.importance === 0) return;
        setCharacterHover(d.id); // Update characterHover with the character's name
        setNetworkHover(
          `<b>${d.id}</b> appears <b>${d.numScenes}</b> time${
            d.numScenes === 1 ? "" : "s"
          } in this chapter`
        );
      })
      .on("mouseout", () => {
        setCharacterHover(""); // Clear characterHover when not hovering
        setNetworkHover("");
      });

    // Apply zoom behavior to the SVG
    zoomRef.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // Zoom limits
      .on("zoom", (event) => {
        zoomLayer.attr("transform", event.transform);
      });

    svg.call(zoomRef.current as any);

    return () => {
      simulation.stop(); // Clean up the simulation on unmount
      svg.on(".zoom", null); // Remove zoom behavior on unmount
    };
  }, [cur_scene, cumulativeMode]);

  // Reset Zoom function
  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // find all nodes connected to the hovered character
    let connectedNodes = new Set();
    if (characterHover !== "") {
      const links = svg.selectAll("line").data();
      links.forEach((link: any) => {
        if (link.lighter) {
          return;
        }
        if (link.source.id === characterHover) {
          connectedNodes.add(link.target.id);
        } else if (link.target.id === characterHover) {
          connectedNodes.add(link.source.id);
        }
      });
    }

    // adjust nodes
    svg
      .selectAll("circle")
      .transition()
      .duration(200) // Smooth transition effect
      .attr("fill-opacity", (d: any) =>
        (linkHover.length == 0 &&
          characterHover === "" &&
          d.importance !== 0) ||
        linkHover.includes(d.id) ||
        characterHover === d.id
          ? 1
          : connectedNodes.has(d.id)
          ? 0.75
          : 0.25
      );

    // adjust labels
    svg
      .selectAll("text")
      .transition()
      .duration(200) // Smooth transition effect
      .attr("fill-opacity", (d: any) =>
        (linkHover.length == 0 &&
          characterHover === "" &&
          d.importance !== 0) ||
        linkHover.includes(d.id) ||
        characterHover === d.id
          ? 1
          : connectedNodes.has(d.id)
          ? 0.75
          : 0.25
      )
      // adjust font weight
      .attr("font-weight", (d: any) =>
        characterHover === d.id || linkHover.includes(d.id) ? "600" : "normal"
      );

    // adjust links
    svg
      .selectAll("line")
      .transition()
      .duration(200) // Smooth transition effect
      .attr("stroke", (d: any) =>
        linkHover.includes(d.source.id) && linkHover.includes(d.target.id)
          ? "#222" // Highlight color for hovered links
          : (characterHover === d.source.id ||
              characterHover === d.target.id) &&
            !d.lighter
          ? "#777"
          : "#ddd"
      )
      .attr("stroke-opacity", (d: any) =>
        (linkHover.length == 0 && characterHover === "" && !d.lighter) ||
        (linkHover.includes(d.source.id) && linkHover.includes(d.target.id)) ||
        ((characterHover === d.source.id || characterHover === d.target.id) &&
          !d.lighter)
          ? 0.75 // Fully visible when hovered
          : 0.2
      );
  }, [linkHover, characterHover]); // Only runs when linkHover or characterHover changes

  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll("circle")
      .transition()
      .duration(200) // Smooth transition effect
      .attr("fill", (d: any) => {
        // Apply the correct color based on characterColor
        const c_name = d.id;
        const emotion_val = d.emotion;
        const importance_val = d.importance;
        return getNodeColor(c_name, emotion_val, importance_val);
      });
  }, [characterColor]); // Only run when `characterColor` changes

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} style={{ maxWidth: "100%" }} />
      <Button
        className="reset"
        onClick={resetZoom}
        size="xs"
        // style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        Reset Network
      </Button>
    </div>
  );
}

export default CharacterNetwork;
