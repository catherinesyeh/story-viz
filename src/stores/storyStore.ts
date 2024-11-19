import { create } from "zustand";

// values that don't need to persist across sessions
interface IStore {
  story: string;
  setStory: (val: string) => void;
  yAxis: string;
  setYAxis: (val: string) => void;
  chapterView: boolean;
  setChapterView: (val: boolean) => void;
  themeView: boolean;
  setThemeView: (val: boolean) => void;
  fullHeight: boolean;
  setFullHeight: (val: boolean) => void;
  scaleByLength: boolean;
  setScaleByLength: (val: boolean) => void;

  storyMarginTop: number;
  setStoryMarginTop: (val: number) => void;
  yAxisHeight: number;
  setYAxisHeight: (val: number) => void;
  xAxisWidth: number;
  setXAxisWidth: (val: number) => void;
  storyScroll: number;
  setStoryScroll: (val: number) => void;
  storyScrollX: number;
  setStoryScrollX: (val: number) => void;

  showOverlay: boolean;
  setShowOverlay: (val: boolean) => void;
  colorBy: string;
  setColorBy: (val: string) => void;
  sizeBy: string;
  setSizeBy: (val: string) => void;
  weightBy: string;
  setWeightBy: (val: string) => void;
  characterColor: string;
  setCharacterColor: (val: string) => void;
  showChapters: boolean;
  setShowChapters: (val: boolean) => void;

  locationHover: string;
  setLocationHover: (val: string) => void;
  characterHover: string;
  setCharacterHover: (val: string) => void;
  groupHover: string;
  setGroupHover: (val: string) => void;
  sceneHover: string;
  setSceneHover: (val: string) => void;
  hidden: string[];
  setHidden: (val: string[]) => void;
  showLegend: boolean;
  setShowLegend: (val: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;

  resetAll: () => void;
}

const initialState = {
  yAxis: "location",
  colorBy: "sentiment",
  sizeBy: "importance",
  weightBy: "conflict",
  characterColor: "llm",
  showChapters: false,
  scaleByLength: false,
  showOverlay: false,

  storyScroll: 0,
  storyScrollX: 0,

  locationHover: "",
  characterHover: "",
  groupHover: "",
  sceneHover: "",
  hidden: [],
  showLegend: true,
};

export const storyStore = create<IStore>()((set) => ({
  story: "gatsby",
  chapterView: false,
  themeView: false,
  fullHeight: false,
  yAxisHeight: 0,
  xAxisWidth: 0,
  storyMarginTop: 0,
  sidebarOpen: false,
  ...initialState,

  setStory: (val: string) => set({ story: val }),
  setYAxis: (val: string) => set({ yAxis: val }),
  setChapterView: (val: boolean) => set({ chapterView: val }),
  setThemeView: (val: boolean) => set({ themeView: val }),
  setFullHeight: (val: boolean) => set({ fullHeight: val }),
  setYAxisHeight: (val: number) => set({ yAxisHeight: val }),
  setXAxisWidth: (val: number) => set({ xAxisWidth: val }),
  setScaleByLength: (val: boolean) => set({ scaleByLength: val }),

  setStoryMarginTop: (val: number) => set({ storyMarginTop: val }),
  setStoryScroll: (val: number) => set({ storyScroll: val }),
  setStoryScrollX: (val: number) => set({ storyScrollX: val }),

  setShowOverlay: (val: boolean) => set({ showOverlay: val }),
  setColorBy: (val: string) => set({ colorBy: val }),
  setSizeBy: (val: string) => set({ sizeBy: val }),
  setWeightBy: (val: string) => set({ weightBy: val }),
  setCharacterColor: (val: string) => set({ characterColor: val }),
  setShowChapters: (val: boolean) => set({ showChapters: val }),

  setLocationHover: (val: string) => set({ locationHover: val }),
  setCharacterHover: (val: string) => set({ characterHover: val }),
  setGroupHover: (val: string) => set({ groupHover: val }),
  setSceneHover: (val: string) => set({ sceneHover: val }),
  setHidden: (val: string[]) => set({ hidden: val }),
  setShowLegend: (val: boolean) => set({ showLegend: val }),
  setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),
  resetAll: () => set({ ...initialState }),
}));
