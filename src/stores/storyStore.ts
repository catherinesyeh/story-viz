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
  customHover: string;
  setCustomHover: (val: string) => void;
  sceneHover: string;
  setSceneHover: (val: string) => void;
  chapterHover: string;
  setChapterHover: (val: string) => void;
  hidden: string[];
  setHidden: (val: string[]) => void;
  showLegend: boolean;
  setShowLegend: (val: boolean) => void;
  minimized: string[];
  setMinimized: (val: string[]) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  detailView: boolean;
  setDetailView: (val: boolean) => void;

  showChapterText: boolean;
  setShowChapterText: (val: boolean) => void;
  curScrollScene: string;
  setCurScrollScene: (val: string) => void;
  scrollSource: boolean;
  setScrollSource: (val: boolean) => void;
  cumulativeMode: boolean;
  setCumulativeMode: (val: boolean) => void;

  modalOpened: boolean;
  setModalOpened: (val: boolean) => void;
  modalLoading: boolean;
  setModalLoading: (val: boolean) => void;
  modalType: string;
  setModalType: (val: string) => void;

  isBackendActive: boolean;
  setIsBackendActive: (val: boolean) => void;
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
  customHover: "",
  sceneHover: "",
  chapterHover: "",
  hidden: [],
  minimized: [],
  showLegend: true,
  cumulativeMode: false,
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
  detailView: false,
  showChapterText: false,
  curScrollScene: "",
  scrollSource: false,
  modalOpened: false,
  modalLoading: false,
  modalType: "",
  isBackendActive: false,
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
  setCustomHover: (val: string) => set({ customHover: val }),
  setSceneHover: (val: string) => set({ sceneHover: val }),
  setChapterHover: (val: string) => set({ chapterHover: val }),
  setHidden: (val: string[]) => set({ hidden: val }),
  setShowLegend: (val: boolean) => set({ showLegend: val }),
  setMinimized: (val: string[]) => set({ minimized: val }),
  setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),
  setDetailView: (val: boolean) => set({ detailView: val }),

  setShowChapterText: (val: boolean) => set({ showChapterText: val }),
  setCurScrollScene: (val: string) => set({ curScrollScene: val }),
  setScrollSource: (val: boolean) => set({ scrollSource: val }),
  setCumulativeMode: (val: boolean) => set({ cumulativeMode: val }),
  setModalOpened: (val: boolean) => set({ modalOpened: val }),
  setModalLoading: (val: boolean) => set({ modalLoading: val }),
  setModalType: (val: string) => set({ modalType: val }),

  setIsBackendActive: (val: boolean) => set({ isBackendActive: val }),
  resetAll: () => set({ ...initialState }),
}));
