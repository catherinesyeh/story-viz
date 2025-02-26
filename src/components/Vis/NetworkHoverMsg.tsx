import { useEffect, useState } from "react";
import { storyStore } from "../../stores/storyStore";

function NetworkHoverMsg() {
  const { networkHover } = storyStore();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const buffer = 10;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      let curX = event.clientX;
      let curY = event.clientY;

      setMousePosition({ x: curX, y: curY });
    };
    if (networkHover !== "") {
      // Add event listener to track mouse movement
      window.addEventListener("mousemove", handleMouseMove);
    }
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [networkHover]);

  return (
    <div
      id={"network-hover-msg"}
      className={networkHover === "" ? "hidden" : ""}
      style={{
        left: mousePosition.x + "px",
        top: mousePosition.y + buffer + "px",
      }}
      dangerouslySetInnerHTML={{ __html: networkHover }}
    ></div>
  );
}

export default NetworkHoverMsg;
