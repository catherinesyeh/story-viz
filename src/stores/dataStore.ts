import { create } from "zustand";

// values that don't need to persist across sessions
export interface IStore {
  data: any;
  setData: (val: any) => void;
}

const initialState = {
  data: await import(`../data/gatsby.json`),
};

export const dataStore = create<IStore>()((set) => ({
  ...initialState,
  setData: (val: any) => set({ data: val }),
}));
