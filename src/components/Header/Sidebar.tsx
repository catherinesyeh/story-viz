import { Accordion, Button, Drawer, Select, Switch } from "@mantine/core";
import { storyStore } from "../../stores/storyStore";
import Colorbar from "../Legend/Colorbar";
import Colorgrid from "../Legend/Colorgrid";
import LegendDiv from "../Legend/LegendDiv";
import { IoMdOpen } from "react-icons/io";
import { dataStore } from "../../stores/dataStore";
import { useEffect } from "react";
import { checkBackendStatus } from "../../server";
import InfoTooltip from "../Misc/InfoTooltip";

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
            <Accordion.Control icon={themeView ? "💭" : "👩🏻"}>
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
                    {themeView ? "theme" : "character"} in scene. Hover on a
                    ribbon for more info. Click on a color square below to
                    filter.
                  </i>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div
                      className="two-col"
                      style={{
                        alignItems: "end",
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
                          label={
                            <span>
                              Ribbon color
                              <InfoTooltip
                                label={`change what the color of each ${
                                  themeView ? "theme" : "character"
                                } ribbon represents`}
                              />
                            </span>
                          }
                          data={characterColorOptions}
                          value={characterColor}
                          onChange={(value) => {
                            if (value) setCharacterColor(value);
                          }}
                          searchable
                        />
                      </div>
                      <Button
                        size="xs"
                        variant="gradient"
                        gradient={{ from: "#9c85c0", to: "#dd8047", deg: 0 }}
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
                    <i className="annotation">
                      Hover on a {chapterView ? "chapter" : "scene"} in the plot
                      for more info.
                    </i>
                    <div className="two-col" style={{ marginTop: "0.75rem" }}>
                      <Switch
                        size="xs"
                        label={
                          <span>
                            Scale by length
                            <InfoTooltip
                              label={`adjust plot spacing based on ${
                                chapterView ? "chapter" : "scene"
                              } length`}
                            />
                          </span>
                        }
                        labelPosition="right"
                        checked={scaleByLength}
                        onChange={(event) =>
                          setScaleByLength(event.currentTarget.checked)
                        }
                      />
                      <Switch
                        size="xs"
                        label={
                          <span>
                            Show color bands
                            <InfoTooltip
                              label={`show ${colorBy} bands at the bottom of plot`}
                            />
                          </span>
                        }
                        labelPosition="right"
                        disabled={colorBy === "default"}
                        checked={showOverlay}
                        onChange={(event) =>
                          setShowOverlay(event.currentTarget.checked)
                        }
                      />
                    </div>
                    <div className="two-col margin-bottom margin-top">
                      <Select
                        size="xs"
                        label={
                          <span>
                            Font size
                            <InfoTooltip
                              label={`change what the size of each ${
                                chapterView ? "chapter" : "scene"
                              } label represents`}
                            />
                          </span>
                        }
                        data={sizeByOptions}
                        value={sizeBy}
                        onChange={(value) => {
                          if (value) setSizeBy(value);
                        }}
                      />
                      <Select
                        size="xs"
                        label={
                          <span>
                            Font weight
                            <InfoTooltip
                              label={`change what the weight of each ${
                                chapterView ? "chapter" : "scene"
                              } label represents`}
                            />
                          </span>
                        }
                        data={sizeByOptions}
                        value={weightBy}
                        onChange={(value) => {
                          if (value) setWeightBy(value);
                        }}
                      />
                    </div>
                    <Select
                      size="xs"
                      label={
                        <span>
                          Color
                          <InfoTooltip
                            label={`change what the color of each ${
                              chapterView ? "chapter" : "scene"
                            } label / band represents`}
                          />
                        </span>
                      }
                      data={colorByOptions}
                      value={colorBy}
                      onChange={(value) => {
                        if (value) setColorBy(value);
                      }}
                    />
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
        <Button
          size="xs"
          fullWidth
          onClick={() => openModal("deleteStorage")}
          style={{ marginTop: "0.5rem" }}
        >
          Admin: Clear Local Storage
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
