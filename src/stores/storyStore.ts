import { create } from "zustand";

// values that don't need to persist across sessions
interface IStore {
  story: string;
  setStory: (val: string) => void;

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

  locationHover: string;
  setLocationHover: (val: string) => void;
  characterHover: string;
  setCharacterHover: (val: string) => void;
  sceneHover: string;
  setSceneHover: (val: string) => void;
  hidden: string[];
  setHidden: (val: string[]) => void;
  resetAll: () => void;
}

const initialState = {
  overlay: "none",
  colorBy: "sentiment",
  sizeBy: "conflict",
  weightBy: "importance",
  characterColor: "default",

  locationHover: "",
  characterHover: "",
  sceneHover: "",
  hidden: [],
};

export const storyStore = create<IStore>()((set) => ({
  story: "gatsby",
  ...initialState,
  setStory: (val: string) => set({ story: val }),
  setOverlay: (val: string) => set({ overlay: val }),
  setColorBy: (val: string) => set({ colorBy: val }),
  setSizeBy: (val: string) => set({ sizeBy: val }),
  setWeightBy: (val: string) => set({ weightBy: val }),
  setCharacterColor: (val: string) => set({ characterColor: val }),

  setLocationHover: (val: string) => set({ locationHover: val }),
  setCharacterHover: (val: string) => set({ characterHover: val }),
  setSceneHover: (val: string) => set({ sceneHover: val }),
  setHidden: (val: string[]) => set({ hidden: val }),
  resetAll: () => set({ ...initialState }),
}));
