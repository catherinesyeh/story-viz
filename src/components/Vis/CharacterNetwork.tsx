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
} from "../../utils/colors";
import chroma from "chroma-js";

type Node = {
  id: string;
  group: string;
  importance: number;
  color: string;
  x?: number;
  y?: number;
};

function CharacterNetwork() {
  const { sceneHover, characterColor } = storyStore();
  const { scene_data, sceneCharacters, character_data, sortedCharacters } =
    dataStore();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const margin = 10;
  const char_width = 6;

  const cur_scene = scene_data.find((d) => d.name === sceneHover);
  const og_links = cur_scene?.links || [];

  const cur_scene_characters = sceneCharacters.find(
    (d) => d.scene === sceneHover
  );
  const scene_characters = cur_scene_characters?.characters || [];

  const sortedGroups = sortedCharacters.map((char) => char.group);
  const uniqueGroups = [...new Set(sortedGroups)];

  const nodes = scene_characters.map((d) => {
    const c_data = character_data.find((c) => c.character === d);
    const group = c_data?.group;

    const s_data = cur_scene?.characters.find((c) => c.name === d);
    const emotion_val = s_data?.rating || 0;
    const importance_val = s_data?.importance || 0;

    const charColor = getColor(d, sortedCharacters);
    const llmColor = getLLMColor(d, sortedCharacters) || charColor;
    const groupColor = group ? getGroupColor(group, uniqueGroups) : charColor;
    const emotion_color = chroma(emotionColor(emotion_val as number)).css();
    const importance_color = chroma(
      importanceColor(importance_val as number)
    ).css();

    return {
      id: d,
      group: group || "",
      importance: importance_val,
      color:
        characterColor === "llm"
          ? llmColor
          : characterColor === "group"
          ? groupColor
          : characterColor === "sentiment"
          ? emotion_color
          : characterColor === "importance"
          ? importance_color
          : charColor,
    };
  }) as Node[];

  const links = og_links.map((d) => ({
    source: nodes.find((n) => n.id === d.source),
    target: nodes.find((n) => n.id === d.target),
    value: d.value,
  }));
  const min_val = d3.min(links, (d) => d.value) || 0;
  const max_val = d3.max(links, (d) => d.value) || 1;
  const min_importance = d3.min(nodes, (d) => d.importance) || 0;

  useEffect(() => {
    if (
      sceneHover === "" ||
      !nodes ||
      !links ||
      nodes.length === 0 ||
      links.length === 0
    )
      return;

    const svgElement = svgRef.current;
    if (!svgElement) return;

    const parentElement = svgElement.parentElement;
    if (!parentElement) return;

    const width = parentElement.offsetWidth;
    // const height = parentElement.offsetHeight;
    const height = 300;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

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
          node.y = normalize(
            node.y || 0,
            yExtent[0],
            yExtent[1],
            margin,
            height - margin
          );
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

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ddd")
      .attr("stroke-width", (d) => normalize(d.value, min_val, max_val, 1, 8))
      .attr("stroke-opacity", 0.75);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => normalize(d.importance, min_importance, 1, 2, 8))
      .attr("fill", (d) => d.color)
      .call(
        d3
          .drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.id)
      .attr("font-size", (d) =>
        normalize(d.importance, min_importance, 1, 6, 10)
      )
      .attr("dx", (d) => normalize(d.importance, min_importance, 1, 6, 10))
      .attr("dy", ".35em");

    // Handle resizing
    const updateDimensions = () => {
      const newWidth = parentElement.offsetWidth;
      const newHeight = parentElement.offsetHeight;

      svg.attr("width", newWidth).attr("height", newHeight);

      // Update simulation center
      simulation
        .force("center", d3.forceCenter(newWidth / 2, newHeight / 2))
        .alpha(1)
        .restart();
    };

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      simulation.stop(); // Clean up the simulation on unmount
    };
  }, [nodes, links]);

  return <svg ref={svgRef} />;
}

export default CharacterNetwork;
