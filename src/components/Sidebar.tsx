import { Accordion, Button, Drawer, Select, Switch } from "@mantine/core";
import { storyStore } from "../stores/storyStore";
import Colorbar from "./XAxis/Colorbar";
import Colorgrid from "./XAxis/Colorgrid";
import LegendDiv from "./Vis/LegendDiv";
import { IoMdOpen } from "react-icons/io";
import { dataStore } from "../stores/dataStore";
import { useEffect } from "react";
import { checkBackendStatus } from "../server";

function Sidebar() {
  const {
    themeView,
    characterColor,
    setCharacterColor,
    sidebarOpen,
    setSidebarOpen,
    sizeBy,
    setSizeBy,
    weightBy,
    setWeightBy,
    colorBy,
    setColorBy,
    scaleByLength,
    setScaleByLength,
    resetAll,
    showOverlay,
    setShowOverlay,
    chapterView,
    setModalOpened,
    setModalType,
    isBackendActive,
    setIsBackendActive,
  } = storyStore();

  const {
    resetActiveChapters,
    num_chapters,
    characterColorOptions,
    customColorDict,
  } = dataStore();

  const open = () => {
    setSidebarOpen(true);
  };

  const close = () => {
    setSidebarOpen(false);
  };

  const sizeByOptions = [
    { value: "conflict", label: "conflict" },
    { value: "importance", label: "importance" },
    { value: "length", label: "length" },
    { value: "numChars", label: "# characters" },
    { value: "default", label: "default" },
  ];
  const colorByOptions = [
    { value: "conflict", label: "conflict" },
    { value: "sentiment", label: "sentiment" },
    { value: "importance", label: "importance" },
    { value: "length", label: "length" },
    { value: "numChars", label: "# characters" },
    { value: "default", label: "default" },
  ];

  useEffect(() => {
    if (colorBy === "default") {
      setShowOverlay(false);
    }
  }, [colorBy]);

  const openModal = (mod_type: string = "addColor") => {
    setModalType(mod_type);
    setModalOpened(true);
  };

  const fetchBackendStatus = async () => {
    try {
      const res = await checkBackendStatus();
      if (res.status === "ok") {
        setIsBackendActive(true);
        console.log("Backend is active");
      } else {
        setIsBackendActive(false);
        console.log("Backend is not active");
      }
    } catch (error) {
      setIsBackendActive(false);
      console.log("Backend is not active");
    }
  };

  useEffect(() => {
    fetchBackendStatus();
  }, []);

  return (
    <div id="sidebar">
      <Drawer
        position="right"
        opened={sidebarOpen}
        onClose={close}
        title={
          (themeView ? "Theme" : "Character") +
          " / " +
          (chapterView ? "Chapter" : "Scene") +
          " Settings"
        }
      >
        <Accordion
          multiple
          variant="separated"
          defaultValue={["character", "scene"]}
        >
          <Accordion.Item key="character" value="character">
            <Accordion.Control icon={themeView ? "💡" : "👩🏻"}>
              {themeView ? "Themes" : "Characters"}
            </Accordion.Control>
            <Accordion.Panel>
              <div className="sidebar-settings">
                <div
                  className={
                    "options-inner " +
                    (characterColor !== "sentiment" &&
                    characterColor !== "importance"
                      ? "color"
                      : "")
                  }
                >
                  <i className="annotation">
                    Ribbon thickness = relative importance of{" "}
                    {themeView ? "theme" : "character"} in scene
                  </i>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div
                      className="two-col"
                      style={{
                        alignItems: "end",
                        // gridTemplateColumns: "5fr 3fr",
                      }}
                    >
                      <div>
                        <span
                          onClick={() => openModal("deleteColor")}
                          className={
                            "delete-button " +
                            (!Object.keys(customColorDict).includes(
                              characterColor
                            )
                              ? "disabled"
                              : "")
                          }
                        >
                          delete
                        </span>
                        <Select
                          size="xs"
                          label="Color"
                          data={characterColorOptions}
                          value={characterColor}
                          onChange={(value) => {
                            if (value) setCharacterColor(value);
                          }}
                        />
                      </div>
                      <Button
                        size="xs"
                        variant="light"
                        title={
                          isBackendActive
                            ? "Add custom color scheme"
                            : "Backend is not connected"
                        }
                        disabled={!isBackendActive}
                        fullWidth
                        onClick={() => openModal()}
                      >
                        Add custom color scheme
                      </Button>
                    </div>
                    <Colorbar
                      fullWidth
                      barType={
                        characterColor === "sentiment" ||
                        characterColor === "importance"
                          ? characterColor
                          : "default"
                      }
                    />
                    <Colorgrid
                      fullWidth
                      gridType={
                        characterColor === "default" ||
                        characterColor === "llm" ||
                        characterColor === "group" ||
                        Object.keys(customColorDict).includes(characterColor)
                          ? characterColor
                          : ""
                      }
                    />
                  </div>
                  <LegendDiv inSidebar />
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key="scene" value="scene">
            <Accordion.Control icon="📖">
              {chapterView ? "Chapters" : "Scenes"}
            </Accordion.Control>
            <Accordion.Panel>
              <div className="sidebar-settings">
                <div className="options-contain">
                  <div className="options-inner">
                    <div className="two-col">
                      <Switch
                        size="xs"
                        label={"Scale by length"}
                        labelPosition="right"
                        checked={scaleByLength}
                        onChange={(event) =>
                          setScaleByLength(event.currentTarget.checked)
                        }
                      />
                      <Switch
                        size="xs"
                        label="Show overlay curve"
                        labelPosition="right"
                        disabled={colorBy === "default"}
                        checked={showOverlay}
                        onChange={(event) =>
                          setShowOverlay(event.currentTarget.checked)
                        }
                      />
                    </div>
                    {/* <i className="annotation">
                      Font = <span>low</span> -{" "}
                      <span style={{ fontFamily: med_conflict_font }}>
                        medium
                      </span>{" "}
                      -{" "}
                      <span
                        style={{
                          fontFamily: high_conflict_font,
                          letterSpacing: 1,
                          transform: "skewX(-10deg)",
                          display: "inline-block",
                        }}
                      >
                        high
                      </span>{" "}
                      conflict in scene
                    </i> */}
                    <div className="two-col margin-bottom margin-top">
                      <Select
                        size="xs"
                        label="Font size"
                        data={sizeByOptions}
                        value={sizeBy}
                        onChange={(value) => {
                          if (value) setSizeBy(value);
                        }}
                      />
                      <Select
                        size="xs"
                        label="Font weight"
                        data={sizeByOptions}
                        value={weightBy}
                        onChange={(value) => {
                          if (value) setWeightBy(value);
                        }}
                      />
                    </div>
                    {/* <div className="two-col margin-bottom"> */}
                    <Select
                      size="xs"
                      label="Color"
                      data={colorByOptions}
                      value={colorBy}
                      onChange={(value) => {
                        if (value) setColorBy(value);
                      }}
                    />
                    {/* <Select
                        size="xs"
                        label="Overlay"
                        data={overlayOptions}
                        value={overlay}
                        onChange={(value) => {
                          if (value) setOverlay(value);
                        }}
                      /> */}
                    {/* </div> */}
                    <div className="margin-bottom">
                      <Colorbar barType={colorBy} />
                    </div>
                  </div>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Button
          size="xs"
          fullWidth
          onClick={() => {
            resetAll();
            resetActiveChapters(num_chapters);
          }}
          style={{ marginTop: "1rem" }}
        >
          Reset All
        </Button>
      </Drawer>

      <Button
        size="xs"
        onClick={open}
        variant="outline"
        rightSection={<IoMdOpen />}
        style={{ width: 210 }}
      >
        {themeView ? "Theme" : "Character"} /{" "}
        {chapterView ? "Chapter" : "Scene"} Settings
      </Button>
    </div>
  );
}

export default Sidebar;
