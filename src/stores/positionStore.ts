import { create } from "zustand";
import {
  Scene,
  getAllData,
  CharacterScene,
  SceneCharacter,
  CharacterData,
  RatingDict,
} from "../utils/data";
import init_data from "../data/gatsby.json";
import { Box, Position, getAllPositions } from "../utils/positions";

/* INITIAL VALUES */
const init_data_values = getAllData(init_data, false);
const init_pos_values = getAllPositions(
  init_data_values.scene_data,
  init_data_values.scenes,
  init_data_values.locations,
  init_data_values.characterScenes,
  init_data_values.sceneLocations,
  init_data_values.sceneCharacters,
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
  minConflictY: number;
  charInc: number;
  firstPoints: Position[];
  lastPoints: Position[];

  setPositions: (
    scene_data: Scene[],
    scenes: string[],
    locations: string[],
    characterScenes: CharacterScene[],
    sceneLocations: string[],
    sceneCharacters: SceneCharacter[],
    sortedCharacters: CharacterData[],
    evenSpacing: boolean,
    ratingDict: RatingDict,
    yAxis: string,
    customYAxisOptions: string[]
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
  minConflictY: init_pos_values.minConflictY,
  charInc: init_pos_values.charInc,
  firstPoints: init_pos_values.firstPoints,
  lastPoints: init_pos_values.lastPoints,
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
    sortedCharacters: CharacterData[],
    evenSpacing: boolean,
    ratingDict: RatingDict,
    yAxis: string = "location",
    customYAxisOptions: string[] = []
  ) => {
    const newPositions = getAllPositions(
      scene_data,
      scenes,
      locations,
      characterScenes,
      sceneLocations,
      sceneCharacters,
      sortedCharacters,
      evenSpacing,
      ratingDict,
      yAxis,
      customYAxisOptions
    );

    const { characterPaths } = get();
    if (characterPaths === newPositions.characterPaths) {
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
      minConflictY: newPositions.minConflictY,
      charInc: newPositions.charInc,
      firstPoints: newPositions.firstPoints,
      lastPoints: newPositions.lastPoints,
    });
  },
}));
