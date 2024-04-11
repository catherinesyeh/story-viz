import { create } from "zustand";
import {
  Scene,
  CharacterData,
  getAllData,
  LocationData,
  LocationQuote,
  CharacterScene,
  CharacterQuote,
  SceneCharacter,
  SceneSummary,
  RatingDict,
} from "../utils/data";
import init_data from "../data/gatsby.json";

/* INITIAL VALUES */
const init_data_values = getAllData(init_data);

// values that don't need to persist across sessions

interface IStore {
  data: any;

  scene_data: Scene[];
  location_data: LocationData[];
  character_data: CharacterData[];

  locations: string[];
  location_quotes: LocationQuote[];
  location_chunks: string[][];

  characters: string[];
  characterScenes: CharacterScene[];
  character_quotes: CharacterQuote[];
  sortedCharacters: CharacterData[];

  scenes: string[];
  sceneLocations: string[];
  sceneChunks: string[][];
  sceneCharacters: SceneCharacter[];
  sceneSummaries: SceneSummary[];

  ratingDict: RatingDict;

  setData: (val: any) => void;
  setSceneData: (val: Scene[]) => void;
}

const initialState = {
  data: init_data,

  scene_data: init_data_values.scene_data,
  location_data: init_data_values.location_data,
  character_data: init_data_values.character_data,

  locations: init_data_values.locations,
  location_quotes: init_data_values.location_quotes,
  location_chunks: init_data_values.location_chunks,

  characters: init_data_values.characters,
  characterScenes: init_data_values.characterScenes,
  character_quotes: init_data_values.character_quotes,
  sortedCharacters: init_data_values.sortedCharacters,

  scenes: init_data_values.scenes,
  sceneLocations: init_data_values.sceneLocations,
  sceneChunks: init_data_values.sceneChunks,
  sceneCharacters: init_data_values.sceneCharacters,
  sceneSummaries: init_data_values.sceneSummaries,

  ratingDict: init_data_values.ratingDict,
};

export const dataStore = create<IStore>((set) => ({
  ...initialState,
  setData: (init_data: any) => {
    const newData = getAllData(init_data);
    set({
      data: init_data,
      scene_data: newData.scene_data,
      location_data: newData.location_data,
      character_data: newData.character_data,

      locations: newData.locations,
      location_quotes: newData.location_quotes,
      location_chunks: newData.location_chunks,

      characters: newData.characters,
      characterScenes: newData.characterScenes,
      character_quotes: newData.character_quotes,
      sortedCharacters: newData.sortedCharacters,

      scenes: newData.scenes,
      sceneLocations: newData.sceneLocations,
      sceneChunks: newData.sceneChunks,
      sceneCharacters: newData.sceneCharacters,
      sceneSummaries: newData.sceneSummaries,

      ratingDict: newData.ratingDict,
    });
  },
  setSceneData: (val: Scene[]) => set({ scene_data: val }),
}));
