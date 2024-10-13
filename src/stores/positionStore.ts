import { create } from "zustand";
import {
  Scene,
  getAllData,
  LocationQuote,
  CharacterScene,
  SceneCharacter,
  SceneSummary,
  CharacterData,
  RatingDict,
} from "../utils/data";
import init_data from "../data/gatsby.json";
import {
  Box,
  Position,
  SceneSummaryBox,
  SceneSummaryText,
  getAllPositions,
} from "../utils/positions";

/* INITIAL VALUES */
const init_data_values = getAllData(init_data);
const init_pos_values = getAllPositions(
  init_data_values.scene_data,
  init_data_values.scenes,
  init_data_values.locations,
  init_data_values.characterScenes,
  init_data_values.sceneLocations,
  init_data_values.sceneCharacters,
  init_data_values.location_quotes,
  init_data_values.sceneSummaries,
  init_data_values.sortedCharacters,
  true,
  init_data_values.ratingDict
);

// values that don't need to persist across sessions

interface IStore {
  sceneWidth: number;
  plotWidth: number;
  plotHeight: number;
  locationPos: number[];
  scenePos: Position[];
  characterPos: Position[][];
  characterSquares: Box[][];
  characterPaths: string[][];
  sceneBoxes: Box[];
  locationQuoteBoxes: Box[];
  locationQuoteTexts: Position[][];
  sceneSummaryBoxes: SceneSummaryBox[];
  sceneSummaryTexts: SceneSummaryText[];
  colorBarPos: Box[];
  conflictPath: string;
  importancePath: string;
  lengthPath: string;
  minConflictY: number;

  setPositions: (
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    location_quotes: LocationQuote[],
    sceneSummaries: SceneSummary[],
    sortedCharacters: CharacterData[],
    evenSpacing: boolean,
    ratingDict: RatingDict,
    yAxis: string
  ) => void;
  setPaths: (
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    location_quotes: LocationQuote[],
    sceneSummaries: SceneSummary[],
    sortedCharacters: CharacterData[],
    evenSpacing: boolean,
    ratingDict: RatingDict,
    yAxis: string,
    activeScenes: [number, number]
  ) => void;
}

const initialState = {
  sceneWidth: init_pos_values.sceneWidth,
  plotWidth: init_pos_values.plotWidth,
  plotHeight: init_pos_values.plotHeight,
  locationPos: init_pos_values.locationPos,
  scenePos: init_pos_values.scenePos,
  characterPos: init_pos_values.characterPos,
  characterSquares: init_pos_values.characterSquares,
  characterPaths: init_pos_values.characterPaths,
  sceneBoxes: init_pos_values.sceneBoxes,
  locationQuoteBoxes: init_pos_values.locationQuoteBoxes,
  locationQuoteTexts: init_pos_values.locationQuoteTexts,
  sceneSummaryBoxes: init_pos_values.sceneSummaryBoxes,
  sceneSummaryTexts: init_pos_values.sceneSummaryTexts,
  colorBarPos: init_pos_values.colorBarPos,
  conflictPath: init_pos_values.conflictPath,
  importancePath: init_pos_values.importancePath,
  lengthPath: init_pos_values.lengthPath,
  minConflictY: init_pos_values.minConflictY,
};

export const positionStore = create<IStore>((set, get) => ({
  ...initialState,
  setPositions: (
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    location_quotes: LocationQuote[],
    sceneSummaries: SceneSummary[],
    sortedCharacters: CharacterData[],
    evenSpacing: boolean,
    ratingDict: RatingDict,
    yAxis: string = "location"
  ) => {
    const newPositions = getAllPositions(
      scene_data,
      scenes,
      locations,
      characterScenes,
      sceneLocations,
      sceneCharacters,
      location_quotes,
      sceneSummaries,
      sortedCharacters,
      evenSpacing,
      ratingDict,
      yAxis
    );

    const { locationPos } = get();
    if (locationPos === newPositions.locationPos) {
      // no need to update if the locationPos is the same
      return;
    }

    set({
      sceneWidth: newPositions.sceneWidth,
      plotWidth: newPositions.plotWidth,
      plotHeight: newPositions.plotHeight,
      locationPos: newPositions.locationPos,
      scenePos: newPositions.scenePos,
      characterPos: newPositions.characterPos,
      characterSquares: newPositions.characterSquares,
      characterPaths: newPositions.characterPaths,
      sceneBoxes: newPositions.sceneBoxes,
      locationQuoteBoxes: newPositions.locationQuoteBoxes,
      locationQuoteTexts: newPositions.locationQuoteTexts,
      sceneSummaryBoxes: newPositions.sceneSummaryBoxes,
      sceneSummaryTexts: newPositions.sceneSummaryTexts,
      colorBarPos: newPositions.colorBarPos,
      conflictPath: newPositions.conflictPath,
      importancePath: newPositions.importancePath,
      lengthPath: newPositions.lengthPath,
      minConflictY: newPositions.minConflictY,
    });
  },
  setPaths: (
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    location_quotes: LocationQuote[],
    sceneSummaries: SceneSummary[],
    sortedCharacters: CharacterData[],
    evenSpacing: boolean,
    ratingDict: RatingDict,
    yAxis: string = "location",
    activeScenes: [number, number]
  ) => {
    const newPositions = getAllPositions(
      scene_data,
      scenes,
      locations,
      characterScenes,
      sceneLocations,
      sceneCharacters,
      location_quotes,
      sceneSummaries,
      sortedCharacters,
      evenSpacing,
      ratingDict,
      yAxis,
      activeScenes
    );
    set({
      importancePath: newPositions.importancePath,
      lengthPath: newPositions.lengthPath,
      conflictPath: newPositions.conflictPath,
    });
  },
}));
