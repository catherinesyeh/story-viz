/* HELPERS */
// create generic chunk method
// I:  - quote (string): quote to be split into chunks
//     - chunk_size (number): maximum number of characters in each chunk

import { normalize } from "./helpers";

// O:  - (array): array of chunks
const chunkQuote = (quote: string, chunk_size: number) => {
  const quoteChunks = [];
  let chunk = "";
  let words = quote.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (chunk.length + words[i].length < chunk_size) {
      chunk += words[i] + " ";
    } else {
      quoteChunks.push(chunk);
      chunk = words[i] + " ";
    }
  }
  quoteChunks.push(chunk);
  return quoteChunks;
};

/* INTERFACES */
export interface Character {
  name: string;
  importance: number;
  emotion: string;
  quote: string;
  rating: string;
}

export interface Scene {
  number: number;
  name: string;
  location: string;
  characters: Character[];
  summary: string;
  numLines: number;
  ratings: {
    importance: number;
    conflict: number;
    sentiment: number;
  };
}

export interface LocationData {
  name: string;
  key: string;
  quote: string;
}

export interface CharacterData {
  character: string;
  short: string;
  key: string;
  quote: string;
  group: string;
  color: string;
  explanation: string[] | string;
}

export interface ColorQuote {
  character: string;
  quote: string[];
}

export interface LocationQuote {
  location: string;
  quote: string[];
}

export interface CharacterScene {
  character: string;
  scenes: number[];
  locations: string[];
}

export interface CharacterQuote {
  character: string;
  group: string;
  quote: string[];
}

export interface SceneCharacter {
  scene: string;
  characters: string[];
}

export interface SceneSummary {
  scene: string;
  summary: string[];
  emotions: {
    character: string;
    emotion_quote: string[];
  }[];
}

export interface RatingDict {
  importance: number[];
  conflict: number[];
  sentiment: number[];
}

/* DATA */
export const setNumLines = (data: any, evenSpacing: boolean): Scene[] => {
  const scene_data = data.scenes;
  // console.log(scene_data);
  const all_num_lines = scene_data.map((scene: Scene) => scene.numLines);
  const min_lines = Math.min(...all_num_lines);
  const max_lines = Math.max(...all_num_lines);

  // console.log(evenSpacing);

  scene_data.forEach((scene: Scene) => {
    if (!evenSpacing) {
      scene.numLines = normalize(
        scene.numLines,
        min_lines,
        max_lines,
        0.5,
        1.5
      );
    } else {
      scene.numLines = 1;
    }
  });

  return scene_data;
};

const scene_data = (all_data: any): Scene[] => {
  let data = setNumLines(all_data, true);

  // replace importance rating for each scene in scene_data with 1 / rating
  data.forEach((scene: Scene) => {
    if (scene.ratings.importance > 1) {
      scene.ratings.importance =
        (data.length + 1 - scene.ratings.importance) / data.length;
    }

    scene.characters.forEach((character: Character) => {
      // replace importance rating for each character in scene.characters with 1 / rating
      if (character.importance > 1) {
        character.importance =
          (scene.characters.length + 1 - character.importance) /
          scene.characters.length;
      }
    });
  });

  return data;
};

const location_data = (all_data: any): LocationData[] => all_data["locations"];
const character_data = (all_data: any): CharacterData[] => {
  const characters = all_data["characters"];

  // replace explanation with a chunked version of the explanation
  characters.forEach((character: CharacterData) => {
    if (!Array.isArray(character.explanation)) {
      character.explanation = chunkQuote(character.explanation as string, 92);
    }
  });

  return characters;
};

/* LOCATION DATA */
// get all locations by finding unique location values
const locations = (data: Scene[]): string[] =>
  Array.from(new Set(data.map((scene) => scene.location)));

// for each quote in location_data, split quote into chunk_size character chunks, making sure to keep full words
const location_quotes = (
  locations: string[],
  location_data: LocationData[]
): LocationQuote[] =>
  location_data
    .map((location) => {
      const chunked = chunkQuote('"' + location.quote + '"', 82);
      return {
        location: location.name,
        quote: chunked,
      };
    })
    // now sort by the order of 'locations'
    .sort((a, b) => {
      const aIndex = locations.findIndex((loc) => loc === a.location);
      const bIndex = locations.findIndex((loc) => loc === b.location);
      return aIndex - bIndex;
    });
// also chunk the location names
const location_chunks = (
  locations: string[],
  location_data: LocationData[]
): string[][] =>
  location_data
    .sort((a, b) => {
      // sort by the order of 'locations'
      const aIndex = locations.findIndex((loc) => loc === a.name);
      const bIndex = locations.findIndex((loc) => loc === b.name);
      return aIndex - bIndex;
    })
    .map((location) => {
      return chunkQuote(location.name, 24);
    });
/* CHARACTER DATA */
// get all characters by finding unique 'name' values in characters object
const characters = (data: Scene[]): string[] =>
  Array.from(
    new Set(
      data.flatMap((scene) =>
        scene.characters.map((character) => character.name)
      )
    )
  );

const sortCharactersByGroup = (
  data: CharacterData[],
  characterScenes: CharacterScene[]
): CharacterData[] => {
  const groups = Array.from(new Set(data.map((char) => char.group)));
  const sorted = groups.map((group) =>
    data.filter((char) => char.group === group)
  );

  // order characters in each group by order they appear in characterScenes
  sorted.forEach((group) => {
    group.sort((a, b) => {
      const aIndex = characterScenes.findIndex(
        (charScene) =>
          charScene.character.toLowerCase() === a.character.toLowerCase()
      );
      const bIndex = characterScenes.findIndex(
        (charScene) =>
          charScene.character.toLowerCase() === b.character.toLowerCase()
      );
      return aIndex - bIndex;
    });
  });

  // sort groups by the order of the first character in each group
  sorted.sort((a, b) => {
    const aIndex = characterScenes.findIndex(
      (charScene) =>
        charScene.character.toLowerCase() === a[0].character.toLowerCase()
    );
    const bIndex = characterScenes.findIndex(
      (charScene) =>
        charScene.character.toLowerCase() === b[0].character.toLowerCase()
    );
    return aIndex - bIndex;
  });

  // recombine into a single array
  const flatSorted = sorted.flat();
  return flatSorted;
};

// for each character, get all scenes they appear in
// sort by number of scenes they appear in (descending order)
const characterScenes = (
  characters: string[],
  data: Scene[]
): CharacterScene[] =>
  characters
    .map((character) => {
      return {
        character: character,
        scenes: data
          .filter((scene) =>
            scene.characters.some(
              (char) => char.name.toLowerCase() === character.toLowerCase()
            )
          )
          .map((scene) => scene.number - 1),
        // also get all locations this character appears in
        locations: data
          .filter((scene) =>
            scene.characters.some(
              (char) => char.name.toLowerCase() === character.toLowerCase()
            )
          )
          .map((scene) => scene.location),
      };
    })
    .sort((a, b) => {
      const diff = b.scenes.length - a.scenes.length;
      if (diff !== 0) {
        return diff;
      }
      return a.character.localeCompare(b.character);
    });

// for each quote in character-data, split quote into chunk_size character chunks, making sure to keep full words
const character_quotes = (
  character_data: CharacterData[],
  characterScenes: CharacterScene[]
): CharacterQuote[] =>
  character_data
    .map((character) => {
      const start_and_ends_with_quotes =
        (character.quote.startsWith('"') && character.quote.endsWith('"')) ||
        (character.quote.startsWith("“") && character.quote.endsWith("”")) ||
        (character.quote.startsWith("‘") && character.quote.endsWith("’")) ||
        (character.quote.startsWith("'") && character.quote.endsWith("'"));
      const mod_quote = start_and_ends_with_quotes
        ? character.quote
        : '"' + character.quote + '"';
      const chunked = chunkQuote(mod_quote, 80);
      return {
        character: character.character,
        group: character.group,
        quote: chunked,
      };
    })
    .sort((a, b) => {
      // sort by the order in characterScenes
      const aIndex = characterScenes.findIndex(
        (charScene) =>
          charScene.character.toLowerCase() === a.character.toLowerCase()
      );
      const bIndex = characterScenes.findIndex(
        (charScene) =>
          charScene.character.toLowerCase() === b.character.toLowerCase()
      );
      return aIndex - bIndex;
    });

/* SCENE DATA */
// get all scene names using 'name' attribute in each scene object
// index corresponds to scene number
const scenes = (data: Scene[]): string[] => data.map((scene) => scene.name);

// map each scene to location
const sceneLocations = (data: Scene[]): string[] =>
  data.map((scene) => scene.location);

// split scene names into chunks of 30 characters
const sceneChunks = (scenes: string[]): string[][] =>
  scenes.map((scene) => chunkQuote(scene, 20));

// list characters in each scene, sorted by their number of scenes
const sceneCharacters = (
  scenes: string[],
  data: Scene[],
  characterScenes: CharacterScene[]
): SceneCharacter[] =>
  scenes.map((scene) => {
    // find characters in scene using data
    const dataScene = data.find((s) => s.name === scene) as any;
    return {
      scene: scene,
      characters: dataScene.characters
        .map((char: Scene) => char.name)
        .sort((a: string, b: string) => {
          // find index of character in characterScenes
          const aIndex = characterScenes.findIndex(
            (charScene) => charScene.character.toLowerCase() === a.toLowerCase()
          );
          const bIndex = characterScenes.findIndex(
            (charScene) => charScene.character.toLowerCase() === b.toLowerCase()
          );
          return aIndex - bIndex;
        }),
    };
  });

// split scene summaries into chunks of 105 characters
const sceneSummaries = (
  data: Scene[],
  characterScenes: CharacterScene[]
): SceneSummary[] =>
  data.map((scene) => {
    // also chunk each character's quote for the first emotion in their emotions list
    // save in a dictionary with character name as key
    const chunk_size = 117;
    const chunkedEmotions = scene.characters.map((character) => {
      const chunked = chunkQuote('"' + character.quote + '"', chunk_size);
      return { character: character.name, emotion_quote: chunked };
    });

    // sort chunked emotions by the order in characterScenes
    const sortedEmotions = chunkedEmotions.sort((a, b) => {
      const aIndex = characterScenes.findIndex(
        (charScene) =>
          charScene.character.toLowerCase() === a.character.toLowerCase()
      );
      const bIndex = characterScenes.findIndex(
        (charScene) =>
          charScene.character.toLowerCase() === b.character.toLowerCase()
      );
      return aIndex - bIndex;
    });

    const chunked = chunkQuote(scene.summary, chunk_size);
    return {
      scene: scene.name,
      summary: chunked,
      emotions: sortedEmotions,
    };
  });

// create dictionary with importance, conflict, and sentiment ratings, each containing a list of ratings by scene
const ratings = ["importance", "conflict", "sentiment"];
const createRatingDict = (data: Scene[]): RatingDict => {
  const ratingDict: RatingDict = {} as any;
  for (let rating of ratings) {
    const key = rating as keyof RatingDict;
    ratingDict[key] = data.map((scene) => scene.ratings[key]);
  }
  return ratingDict;
};

// generate all data and return
export const getAllData = (init_data: any) => {
  const init_scene_data = scene_data(init_data);
  const init_location_data = location_data(init_data);
  const init_character_data = character_data(init_data);

  console.log(init_character_data);

  const init_locations = locations(init_scene_data);
  const init_location_quotes = location_quotes(
    init_locations,
    init_location_data
  );
  const init_location_chunks = location_chunks(
    init_locations,
    init_location_data
  );

  const init_characters = characters(init_scene_data);
  const init_characterScenes = characterScenes(
    init_characters,
    init_scene_data
  );
  const init_character_quotes = character_quotes(
    init_character_data,
    init_characterScenes
  );
  const init_sorted_characters = sortCharactersByGroup(
    init_character_data,
    init_characterScenes
  );

  const init_scenes = scenes(init_scene_data);
  const init_sceneLocations = sceneLocations(init_scene_data);
  const init_sceneChunks = sceneChunks(init_scenes);
  const init_sceneCharacters = sceneCharacters(
    init_scenes,
    init_scene_data,
    init_characterScenes
  );
  const init_sceneSummaries = sceneSummaries(
    init_scene_data,
    init_characterScenes
  );
  const init_ratingDict = createRatingDict(init_scene_data);

  return {
    scene_data: init_scene_data,
    location_data: init_location_data,
    character_data: init_character_data,
    locations: init_locations,
    location_quotes: init_location_quotes,
    location_chunks: init_location_chunks,
    characters: init_characters,
    characterScenes: init_characterScenes,
    character_quotes: init_character_quotes,
    sortedCharacters: init_sorted_characters,
    scenes: init_scenes,
    sceneLocations: init_sceneLocations,
    sceneChunks: init_sceneChunks,
    sceneCharacters: init_sceneCharacters,
    sceneSummaries: init_sceneSummaries,
    ratingDict: init_ratingDict,
  };
};
