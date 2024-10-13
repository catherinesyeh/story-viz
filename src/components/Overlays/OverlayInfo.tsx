import LocationOverlay from "./LocationOverlay";
import SceneOverlay from "./SceneOverlay";

function OverlayInfo() {
  return (
    <g id="overlay-info">
      <LocationOverlay />
      {/* <CharacterOverlay /> */}
      <SceneOverlay />
    </g>
  );
}
export default OverlayInfo;
