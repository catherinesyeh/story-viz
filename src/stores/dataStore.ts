import { create } from "zustand";
import {
  Scene,
  CharacterData,
  getAllData,
  LocationData,
  CharacterScene,
  SceneCharacter,
  SceneSummary,
  RatingDict,
  ChapterDivision,
} from "../utils/data";
import init_data from "../data/gatsby.json";
import { CustomColorDict, defaultCharacterColors } from "../utils/colors";
import { defaultYAxisOptions } from "../utils/consts";
import localforage from "localforage";

/* INITIAL VALUES */
const init_data_values = getAllData(init_data, false);

// values that don't need to persist across sessions

interface IStore {
  data: any;

  scene_data: Scene[];
  og_scene_data: Scene[];
  chapter_data: Scene[];
  location_data: LocationData[];
  character_data: CharacterData[];

  locations: string[];

  characters: string[];
  characterScenes: CharacterScene[];
  sortedCharacters: CharacterData[];

  scenes: string[];
  sceneLocations: string[];
  sceneChunks: string[][];
  sceneCharacters: SceneCharacter[];
  sceneSummaries: SceneSummary[];

  ratingDict: RatingDict;
  minLines: number;
  maxLines: number;
  sceneMin: number;
  sceneMax: number;
  chapterMin: number;
  chapterMax: number;

  chapterDivisions: ChapterDivision[];
  num_chapters: number;
  activeChapters: [number, number];

  characterColorOptions: string[];
  customColorDict: CustomColorDict;
  yAxisOptions: string[];
  customYAxisOptions: string[];

  setCharacterColorOptions: (val: string[]) => void;
  setCustomColorDict: (val: CustomColorDict, val2: string) => void;
  setYAxisOptions: (val: string[]) => void;
  setCustomYAxisOptions: (val: string[], val2: string) => void;
  setSceneData: (val: Scene[], val2: string, val3: boolean) => void;
  setChapterData: (val: Scene[]) => void;
  setOgSceneData: (val: Scene[], val2: string) => void;
  setCharacterData: (val: CharacterData[], val2: string) => void;
  setSortedCharacters: (val: CharacterData[]) => void;
  setData: (
    val: any,
    val1: string,
    val2: boolean,
    val3: string,
    val4: boolean
  ) => void;
  setActiveChapters: (val: [number, number]) => void;
  resetActiveChapters: (val: number) => void;
}

const initialState = {
  data: init_data,

  scene_data: init_data_values.scene_data,
  og_scene_data: init_data_values.og_scene_data,
  chapter_data: init_data_values.chapter_data,
  location_data: init_data_values.location_data,
  character_data: init_data_values.character_data,

  locations: init_data_values.locations,

  characters: init_data_values.characters,
  characterScenes: init_data_values.characterScenes,
  sortedCharacters: init_data_values.sortedCharacters,

  scenes: init_data_values.scenes,
  sceneLocations: init_data_values.sceneLocations,
  sceneChunks: init_data_values.sceneChunks,
  sceneCharacters: init_data_values.sceneCharacters,
  sceneSummaries: init_data_values.sceneSummaries,

  ratingDict: init_data_values.ratingDict,
  minLines: init_data_values.minLines,
  maxLines: init_data_values.maxLines,
  sceneMin: init_data_values.sceneMin,
  sceneMax: init_data_values.sceneMax,
  chapterMin: init_data_values.chapterMin,
  chapterMax: init_data_values.chapterMax,

  chapterDivisions: init_data_values.chapterDivisions,
  num_chapters: init_data_values.num_chapters,
  activeChapters: [1, init_data_values.num_chapters] as [number, number],

  characterColorOptions: defaultCharacterColors,
  customColorDict: {} as CustomColorDict,
  yAxisOptions: defaultYAxisOptions,
  customYAxisOptions: [] as string[],
};

export const dataStore = create<IStore>((set) => ({
  ...initialState,
  setCharacterColorOptions: (val: string[]) =>
    set({ characterColorOptions: val }),
  setCustomColorDict: (val: CustomColorDict, story: string) => {
    // update local storage
    const localStorageKey = `colorDict-${story}`;
    // localforage.setItem(localStorageKey, JSON.stringify(val));
    localforage.setItem(localStorageKey, val);
    set({ customColorDict: val });
    console.log("Updated custom color dict");
  },
  setYAxisOptions: (val: string[]) => set({ yAxisOptions: val }),
  setCustomYAxisOptions: (val: string[], story: string) => {
    // update local storage
    const localStorageKey = `yAxis-${story}`;
    // localforage.setItem(localStorageKey, JSON.stringify(val));
    localforage.setItem(localStorageKey, val);
    set({ customYAxisOptions: val });
    console.log("Updated custom y-axis options");
  },
  setSortedCharacters: (val: CharacterData[]) => {
    set({ sortedCharacters: val });
  },
  setSceneData: (val: Scene[], story: string, themeView: boolean) => {
    // update local storage
    // if (!themeView) {
    // localforage.setItem(localStorageKey, JSON.stringify(val));
    // }
    set({ scene_data: val });
  },
  setChapterData: (val: Scene[]) => {
    // update local storage
    // const localStorageKey = `chapterData-${story}`;
    // localforage.setItem(localStorageKey, JSON.stringify(val));
    set({ chapter_data: val });
    // console.log("Updated chapter data");
  },
  setOgSceneData: (val: Scene[], story: string) => {
    const localStorageKey = `sceneData-${story}`;
    set({ og_scene_data: val });
    localforage.setItem(localStorageKey, val);
    console.log("Updated og scene data", val);
  },
  setCharacterData: (val: CharacterData[], story: string) => {
    // update local storage
    const localStorageKey = `characterData-${story}`;
    // localforage.setItem(localStorageKey, JSON.stringify(val));
    localforage.setItem(localStorageKey, val);
    set({ character_data: val });
    console.log("Updated character data");
  },
  setData: (
    init_data: any,
    story: string,
    chapterView: boolean = false,
    chapter: string = "",
    same_story: boolean = false
  ) => {
    const localStorageKey = `colorDict-${story}`;
    const yAxisKey = `yAxis-${story}`;

    // Start fetching data from localForage
    const colorDictPromise =
      localforage.getItem<CustomColorDict>(localStorageKey);
    const yAxisOptionsPromise = localforage.getItem<string[]>(yAxisKey);

    // Use Promise.all to wait for both fetch operations to complete
    Promise.all([colorDictPromise, yAxisOptionsPromise])
      .then(([storedDict, storedYAxis]) => {
        let colorDict = storedDict || ({} as CustomColorDict);
        let colorKeys = [...defaultCharacterColors];

        // Update colorKeys if storedDict exists
        if (storedDict) {
          const newKeys = Object.keys(colorDict);
          colorKeys.push(...newKeys.filter((k) => !colorKeys.includes(k)));
          console.log("Loaded custom color dict from local storage");
        } else {
          console.log("No custom color dict found");
        }

        let customAxisOptions = storedYAxis || ([] as string[]);
        let yAxisOptions = [...defaultYAxisOptions];

        // Update yAxisOptions if storedYAxis exists
        if (storedYAxis) {
          yAxisOptions.push(
            ...customAxisOptions.filter((k) => !yAxisOptions.includes(k))
          );
          console.log("Loaded custom y-axis options from local storage");
        } else {
          console.log("No custom y-axis options found");
        }

        // Process the new data
        const newData = getAllData(
          init_data,
          chapterView,
          chapter,
          customAxisOptions
        );

        const updates: Partial<IStore> = {
          data: init_data,
          scene_data: newData.scene_data,
          og_scene_data: newData.og_scene_data,
          location_data: newData.location_data,
          character_data: newData.character_data,
          locations: newData.locations,
          characters: newData.characters,
          characterScenes: newData.characterScenes,
          sortedCharacters: newData.sortedCharacters,
          scenes: newData.scenes,
          sceneLocations: newData.sceneLocations,
          sceneChunks: newData.sceneChunks,
          sceneCharacters: newData.sceneCharacters,
          sceneSummaries: newData.sceneSummaries,
          ratingDict: newData.ratingDict,
          minLines: newData.minLines,
          maxLines: newData.maxLines,
          chapterDivisions: newData.chapterDivisions,
          num_chapters: newData.num_chapters,
          activeChapters: [1, newData.num_chapters],
          customColorDict: colorDict,
          characterColorOptions: colorKeys,
          customYAxisOptions: customAxisOptions,
          yAxisOptions: yAxisOptions,
        };

        // Perform comparison logic only for chapter_data
        if (
          !same_story ||
          updates.sceneMin !== newData.sceneMin ||
          updates.sceneMax !== newData.sceneMax ||
          updates.chapterMin !== newData.chapterMin ||
          updates.chapterMax !== newData.chapterMax ||
          customAxisOptions.length > 0
        ) {
          console.log("Updating chapter data");
          updates.chapter_data = newData.chapter_data;
          updates.sceneMin = newData.sceneMin;
          updates.sceneMax = newData.sceneMax;
          updates.chapterMin = newData.chapterMin;
          updates.chapterMax = newData.chapterMax;
        }

        // Update the state with all the retrieved data
        set(updates);
      })
      .catch((err) => {
        console.error("Error fetching data from local storage", err);
      });
  },
  setActiveChapters: (val: [number, number]) => set({ activeChapters: val }),
  resetActiveChapters: (maxChapter: number) =>
    set({
      activeChapters: [1, maxChapter] as [number, number],
    }),
}));
