import { create } from "zustand";
import {
  Scene,
  getAllData,
  LocationQuote,
  CharacterScene,
  CharacterQuote,
  SceneCharacter,
  SceneSummary,
} from "../utils/data";
import init_data from "../data/gatsby.json";
import { plot_height, plot_width } from "../utils/consts";
import {
  Box,
  Position,
  SceneSummaryBox,
  SceneSummaryText,
  getAllPositions,
} from "../utils/positions";

/* INITIAL VALUES */
const init_data_values = getAllData(init_data);
const init_width = plot_width(init_data_values.scenes);
const init_height = plot_height(init_data_values.locations);
const init_pos_values = getAllPositions(
  init_width,
  init_height,
  init_data_values.scene_data,
  init_data_values.scenes,
  init_data_values.locations,
  init_data_values.characterScenes,
  init_data_values.sceneLocations,
  init_data_values.sceneCharacters,
  init_data_values.location_quotes,
  init_data_values.sceneSummaries,
  init_data_values.character_quotes,
  init_data_values.reverseCharacterNames
);

// values that don't need to persist across sessions

interface IStore {
  locationPos: number[];
  scenePos: Position[];
  characterPos: Position[][];
  characterSquares: Box[][];
  characterPaths: string[][];
  sceneBoxes: Box[];
  legendPos: Position[];
  legendBoxPos: Box;
  locationQuoteBoxes: Box[];
  locationQuoteTexts: Position[][];
  characterQuoteBoxes: Box[];
  characterQuoteTexts: Position[][];
  sceneSummaryBoxes: SceneSummaryBox;
  sceneSummaryTexts: SceneSummaryText[];
  colorBarPos: Box[];
  conflictPoints: Position[];
  conflictPath: string;

  setPositions: (
    plotWidth: number,
    plotHeight: number,
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    location_quotes: LocationQuote[],
    sceneSummaries: SceneSummary[],
    character_quotes: CharacterQuote[],
    reverseCharacterNames: CharacterScene[]
  ) => void;
}

const initialState = {
  locationPos: init_pos_values.locationPos,
  scenePos: init_pos_values.scenePos,
  characterPos: init_pos_values.characterPos,
  characterSquares: init_pos_values.characterSquares,
  characterPaths: init_pos_values.characterPaths,
  sceneBoxes: init_pos_values.sceneBoxes,
  legendPos: init_pos_values.legendPos,
  legendBoxPos: init_pos_values.legendBoxPos,
  locationQuoteBoxes: init_pos_values.locationQuoteBoxes,
  locationQuoteTexts: init_pos_values.locationQuoteTexts,
  characterQuoteBoxes: init_pos_values.characterQuoteBoxes,
  characterQuoteTexts: init_pos_values.characterQuoteTexts,
  sceneSummaryBoxes: init_pos_values.sceneSummaryBoxes,
  sceneSummaryTexts: init_pos_values.sceneSummaryTexts,
  colorBarPos: init_pos_values.colorBarPos,
  conflictPoints: init_pos_values.conflictPoints,
  conflictPath: init_pos_values.conflictPath,
};

export const positionStore = create<IStore>((set) => ({
  ...initialState,
  setPositions: (
    plotWidth: number,
    plotHeight: number,
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    location_quotes: LocationQuote[],
    sceneSummaries: SceneSummary[],
    character_quotes: CharacterQuote[],
    reverseCharacterNames: CharacterScene[]
  ) => {
    const newPositions = getAllPositions(
      plotWidth,
      plotHeight,
      scene_data,
      scenes,
      locations,
      characterScenes,
      sceneLocations,
      sceneCharacters,
      location_quotes,
      sceneSummaries,
      character_quotes,
      reverseCharacterNames
    );
    set({
      locationPos: newPositions.locationPos,
      scenePos: newPositions.scenePos,
      characterPos: newPositions.characterPos,
      characterSquares: newPositions.characterSquares,
      characterPaths: newPositions.characterPaths,
      sceneBoxes: newPositions.sceneBoxes,
      legendPos: newPositions.legendPos,
      legendBoxPos: newPositions.legendBoxPos,
      locationQuoteBoxes: newPositions.locationQuoteBoxes,
      locationQuoteTexts: newPositions.locationQuoteTexts,
      characterQuoteBoxes: newPositions.characterQuoteBoxes,
      characterQuoteTexts: newPositions.characterQuoteTexts,
      sceneSummaryBoxes: newPositions.sceneSummaryBoxes,
      sceneSummaryTexts: newPositions.sceneSummaryTexts,
      colorBarPos: newPositions.colorBarPos,
      conflictPoints: newPositions.conflictPoints,
      conflictPath: newPositions.conflictPath,
    });
  },
}));
