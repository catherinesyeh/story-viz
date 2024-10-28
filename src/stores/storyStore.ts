import { create } from "zustand";

// values that don't need to persist across sessions
interface IStore {
  story: string;
  setStory: (val: string) => void;
  yAxis: string;
  setYAxis: (val: string) => void;
  fullHeight: boolean;
  setFullHeight: (val: boolean) => void;
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

  overlay: string;
  setOverlay: (val: string) => void;
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

  resetAll: () => void;
}

const initialState = {
  yAxis: "location",
  overlay: "none",
  colorBy: "sentiment",
  sizeBy: "length",
  weightBy: "importance",
  characterColor: "llm",
  showChapters: false,

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
  fullHeight: false,
  yAxisHeight: 0,
  xAxisWidth: 0,
  storyMarginTop: 0,
  ...initialState,

  setStory: (val: string) => set({ story: val }),
  setYAxis: (val: string) => set({ yAxis: val }),
  setFullHeight: (val: boolean) => set({ fullHeight: val }),
  setYAxisHeight: (val: number) => set({ yAxisHeight: val }),
  setXAxisWidth: (val: number) => set({ xAxisWidth: val }),

  setStoryMarginTop: (val: number) => set({ storyMarginTop: val }),
  setStoryScroll: (val: number) => set({ storyScroll: val }),
  setStoryScrollX: (val: number) => set({ storyScrollX: val }),

  setOverlay: (val: string) => set({ overlay: val }),
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
  resetAll: () => set({ ...initialState }),
}));
