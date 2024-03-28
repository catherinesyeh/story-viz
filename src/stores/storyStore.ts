import { create } from "zustand";

// values that don't need to persist across sessions
interface IStore {
  showConflict: boolean;
  setShowConflict: (val: boolean) => void;
  colorBy: string;
  setColorBy: (val: string) => void;
  sizeBy: string;
  setSizeBy: (val: string) => void;
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
}

const initialState = {
  showConflict: false,
  colorBy: "default",
  sizeBy: "default",
  characterColor: "default",

  locationHover: "",
  characterHover: "",
  sceneHover: "",
  hidden: [],
};

export const storyStore = create<IStore>()((set) => ({
  ...initialState,
  setShowConflict: (val: boolean) => set({ showConflict: val }),
  setColorBy: (val: string) => set({ colorBy: val }),
  setSizeBy: (val: string) => set({ sizeBy: val }),
  setCharacterColor: (val: string) => set({ characterColor: val }),

  setLocationHover: (val: string) => set({ locationHover: val }),
  setCharacterHover: (val: string) => set({ characterHover: val }),
  setSceneHover: (val: string) => set({ sceneHover: val }),
  setHidden: (val: string[]) => set({ hidden: val }),
}));
