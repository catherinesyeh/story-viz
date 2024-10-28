/* HELPERS */
// create generic chunk method
// I:  - quote (string): quote to be split into chunks
//     - chunk_size (number): maximum number of characters in each chunk

import { getColor } from "./colors";
import { normalize } from "./helpers";

// O:  - (array): array of chunks
const chunkQuote = (quote: string, chunk_size: number) => {
  const quoteChunks = [] as string[];
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
export interface Chapter {
  chapter: string;
  numScenes: number;
  numLines: number;
  summary: string;
  conflict: number;
  importance: number;
  locations: {
    [key: string]: number;
  };
  characters: {
    [key: string]: number;
  };
}
export interface Character {
  name: string;
  importance: number;
  importance_rank: number;
  emotion: string;
  quote: string;
  rating: number;
  role: string;
}

export interface Scene {
  number: number;
  name: string;
  location: string;
  characters: Character[];
  summary: string;
  numLines: number;
  chapter: string;
  text: string;
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
  emoji?: string;
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
  emoji?: string;
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
  length: number[];
}

export interface ChapterDivision {
  chapter: string;
  index: number;
  scenes: string[];
  locations: string[];
  characters: string[];
}

/* DATA */
const chapter_data = (all_data: any): Chapter[] => {
  const data = all_data["chapters"];

  if (!data) {
    return [];
  }

  data.forEach((chapter: any) => {
    chapter.numScenes = chapter.scenes;
    chapter.numLines = chapter.num_lines;
    const importance = chapter.importance_rank;
    if (importance > 1) {
      chapter.importance = (data.length + 1 - importance) / data.length;
    }

    // delete extra fields
    delete chapter.num_lines;
    delete chapter.importance_rank;
    delete chapter.conflict_rank;
    delete chapter.length;
    delete chapter.scenes;
  });

  return data;
};
const scene_data = (all_data: any, chapter_data: Chapter[]): Scene[] => {
  const data = all_data["scenes"];

  const max_characters_per_scene = Math.max(
    ...data.map((scene: any) => scene.characters.length)
  );

  data.forEach((scene: any, i: number) => {
    // fix data inconsistencies
    scene.name = scene.name ? scene.name : scene.title;
    scene.number = i + 1;
    scene.numLines = scene.num_lines ? scene.num_lines : scene.numLines;
    scene.text = scene.text ? scene.text : "";
    scene.ratings = scene.ratings ? scene.ratings : {};
    scene.ratings.conflict = scene.ratings.conflict
      ? scene.ratings.conflict
      : scene.conflict
      ? scene.conflict
      : 0;
    let importance_scalar = 1;
    let length_to_compare = data.length;
    let chapter_importance = 0;
    if (chapter_data.length > 0) {
      // find chapter with the same name as scene.chapter
      const chapter = chapter_data.find(
        (chap) => chap.chapter === scene.chapter
      );
      length_to_compare = chapter ? chapter.numScenes : data.length;
      chapter_importance = chapter ? chapter.importance : 0;
      importance_scalar = 0.5;
    }

    // replace importance rating for each scene in scene_data with 1 / rating
    const importance = scene.importance_rank
      ? scene.importance_rank
      : scene.ratings.importance;
    if (importance > 1 || !scene.ratings.importance) {
      scene.ratings.importance =
        ((length_to_compare + 1 - importance) / length_to_compare) *
          importance_scalar +
        chapter_importance * importance_scalar;
    }

    const characters = scene.characters;
    const num_characters = characters.length;
    const all_sentiments = [] as number[];

    characters.forEach((character: any) => {
      // replace importance rating for each character in scene.characters with 1 / rating
      character.importance_rank = character.importance_rank
        ? character.importance_rank
        : character.importance >= 1
        ? character.importance
        : character.importance * num_characters;
      // if (!character.importance || character.importance > 1) {
      character.importance =
        (max_characters_per_scene + 1 - character.importance_rank) /
        max_characters_per_scene;
      // }
      character.rating = character.rating
        ? character.rating
        : character.sentiment
        ? character.sentiment
        : 0;
      all_sentiments.push(character.rating);
      character.role = character.role ? character.role : "";

      // remove extra fields
      delete character.sentiment;
    });

    scene.ratings.sentiment = scene.ratings.sentiment
      ? scene.ratings.sentiment
      : all_sentiments.reduce((a, b) => a + b, 0) / all_sentiments.length;

    // remove extra fields
    delete scene.conflict;
    delete scene.conflict_rank;
    delete scene.importance;
    delete scene.importance_rank;
    delete scene.first_line;
    delete scene.last_line;
    delete scene.length;
    delete scene.title;
    delete scene.num_lines;
  });

  return data;
};

const location_data = (all_data: any): LocationData[] => all_data["locations"];
const character_data = (all_data: any): CharacterData[] => {
  const characters = all_data["characters"];

  // replace explanation with a chunked version of the explanation
  characters.forEach((character: any) => {
    // fix data inconsistencies
    character.character = character.character
      ? character.character
      : character.name;
    character.key = character.key ? character.key : character.character;
    character.group = character.group.toLowerCase();

    if (!Array.isArray(character.explanation)) {
      character.explanation = chunkQuote(character.explanation as string, 92);
    }

    // remove extra fields
    delete character.name;
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
      const chunked = chunkQuote('"' + location.quote + '"', 80);
      return {
        location: location.name,
        quote: chunked,
        emoji: location.emoji ? location.emoji : "",
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
      return chunkQuote(location.name, 22);
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

  const no_color_characters = flatSorted.filter(
    (char: any) => !char.color || char.color === ""
  );
  // add color to characters without color
  flatSorted.forEach((char: any) => {
    if (!char.color || char.color === "") {
      const color = getColor(char.character, no_color_characters);
      char.color = color;
    }
  });
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
const sceneSummaries = (data: Scene[]): SceneSummary[] =>
  data.map((scene) => {
    // also chunk each character's quote for the first emotion in their emotions list
    // save in a dictionary with character name as key
    const chunk_size = 117;
    const characters = scene.characters;
    const chunkedEmotions = characters.map((character) => {
      const chunked = chunkQuote('"' + character.quote + '"', chunk_size);
      return { character: character.name, emotion_quote: chunked };
    });

    // sort chunked emotions by the order in characterScenes
    // const sortedEmotions = chunkedEmotions.sort((a, b) => {
    //   const aIndex = characterScenes.findIndex(
    //     (charScene) =>
    //       charScene.character.toLowerCase() === a.character.toLowerCase()
    //   );
    //   const bIndex = characterScenes.findIndex(
    //     (charScene) =>
    //       charScene.character.toLowerCase() === b.character.toLowerCase()
    //   );
    //   return aIndex - bIndex;
    // });

    // sort chunked emotions by character importance rank
    const sortedEmotions = chunkedEmotions.sort((a, b) => {
      const aImportRank =
        characters.find((c) => c.name === a.character)?.importance_rank || 0;
      const bImportRank =
        characters.find((c) => c.name === b.character)?.importance_rank || 0;
      return aImportRank - bImportRank;
    });

    const chunked = chunkQuote(scene.summary, chunk_size);
    return {
      scene: scene.name,
      summary: chunked,
      emotions: sortedEmotions,
    };
  });

// get min and max in numLines
const getMinMaxLines = (data: Scene[]) => {
  const minLines = Math.min(...data.map((scene) => scene.numLines));
  const maxLines = Math.max(...data.map((scene) => scene.numLines));

  return [minLines, maxLines];
};

// create dictionary with importance, conflict, and sentiment ratings, each containing a list of ratings by scene
const ratings = ["importance", "conflict", "sentiment", "length"];
const createRatingDict = (data: Scene[]): any => {
  const ratingDict: RatingDict = {} as any;

  const minMax = getMinMaxLines(data);
  const minLines = minMax[0];
  const maxLines = minMax[1];

  for (let rating of ratings) {
    const key = rating as keyof RatingDict;
    if (key === "length") {
      ratingDict[key] = data.map((scene) =>
        normalize(scene.numLines, minLines, maxLines, 0, 1)
      );
    } else {
      ratingDict[key] = data.map((scene) => scene.ratings[key]);
    }
  }
  return {
    ratingDict: ratingDict,
    minLines: minLines,
    maxLines: maxLines,
  };
};

// get chapter divisions by finding last instance of each unique chapter name
const getChapterDivisions = (data: Scene[]): ChapterDivision[] => {
  const chapters = Array.from(new Set(data.map((scene) => scene.chapter)));

  const chapterDivisions = chapters.map((chapter) => {
    // find first instance of chapter
    const firstSceneIndex = data.findIndex(
      (scene) => scene.chapter === chapter
    );

    // save all scenes in chapter
    const chapterScenes = data.filter((scene) => scene.chapter === chapter);

    // find all scenes in chapter and save name of each scene
    const sceneNames = chapterScenes.map((scene) => scene.name);

    // find all locations in chapter
    const chapterLocations = Array.from(
      new Set(chapterScenes.map((scene) => scene.location))
    );

    // find all characters in chapter
    const chapterCharacters = Array.from(
      new Set(
        chapterScenes.flatMap((scene) =>
          scene.characters.map((char) => char.name)
        )
      )
    );

    return {
      chapter: chapter,
      index: firstSceneIndex,
      scenes: sceneNames,
      locations: chapterLocations,
      characters: chapterCharacters,
    };
  });

  return chapterDivisions;
};

// generate all data and return
export const getAllData = (init_data: any) => {
  const init_chapter_data = chapter_data(init_data);
  const init_scene_data = scene_data(init_data, init_chapter_data);
  const init_location_data = location_data(init_data);
  const init_character_data = character_data(init_data);

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
  const init_sceneSummaries = sceneSummaries(init_scene_data);

  const rating_info = createRatingDict(init_scene_data);
  const init_ratingDict = rating_info.ratingDict;
  const minLines = rating_info.minLines;
  const maxLines = rating_info.maxLines;

  const chapterDivisions = getChapterDivisions(init_scene_data);
  const num_chapters = chapterDivisions.length;

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
    minLines: minLines,
    maxLines: maxLines,
    chapterDivisions: chapterDivisions,
    num_chapters: num_chapters,
  };
};
