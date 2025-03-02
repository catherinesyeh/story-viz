import { useEffect, useState } from "react";
import { storyStore } from "../../stores/storyStore";

function LegendHoverMsg() {
  const { legendHover } = storyStore();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const buffer = 10;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      let curX = event.clientX;
      let curY = event.clientY;

      let maxX = window.innerWidth - 80;

      if (curX > maxX) {
        curX = maxX;
      }

      setMousePosition({ x: curX, y: curY });
    };
    if (legendHover !== "") {
      // Add event listener to track mouse movement
      window.addEventListener("mousemove", handleMouseMove);
    }
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [legendHover]);

  return (
    <div
      id={"legend-hover-msg"}
      className={legendHover === "" ? "hidden" : ""}
      style={{
        left: mousePosition.x + "px",
        top: mousePosition.y + buffer + "px",
      }}
    >
      {legendHover}
    </div>
  );
}

export default LegendHoverMsg;
