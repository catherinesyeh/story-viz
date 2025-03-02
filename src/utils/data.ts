/* HELPERS */
// create generic chunk method
// I:  - quote (string): quote to be split into chunks
//     - chunk_size (number): maximum number of characters in each chunk

import { getColor } from "./colors";
import { extractChapterName } from "./helpers";

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

const starts_or_ends_with_quote = (quote: string) => {
  return (
    quote.startsWith('"') ||
    quote.endsWith('"') ||
    quote.startsWith("“") ||
    quote.endsWith("”") ||
    quote.startsWith("‘") ||
    quote.endsWith("’") ||
    quote.startsWith("'") ||
    quote.endsWith("'")
  );
};

/* INTERFACES */
export interface CharacterLink {
  source: string;
  target: string;
  value: number;
  interaction?: string;
}
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
  links?: CharacterLink[];
}
export interface Character {
  name: string;
  importance: number;
  importance_rank: number;
  emotion: string;
  quote: string;
  fake_quote?: string;
  rating: number;
  role: string;
  numScenes?: number;
  top_scene?: number;
  [key: string]: any; // additional fields that could be added by user
}

export interface Scene {
  number: number;
  name: string;
  location: string;
  characters: Character[];
  summary: string;
  firstLine: number;
  lastLine: number;
  numLines: number;
  chapter: string;
  // text: string;
  ratings: {
    importance: number;
    conflict: number;
    sentiment: number;
  };
  numScenes?: number;
  allLocations?: {
    [key: string]: number;
  };
  links?: CharacterLink[];
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
  [key: string]: any; // additional fields that could be added by user
}
export interface CharacterScene {
  character: string;
  scenes: number[];
  locations: string[];
}

export interface SceneCharacter {
  scene: string;
  characters: string[];
  groups: string[];
}

export interface SceneSummary {
  scene: string;
  summary: string[];
  emotions: {
    character: string;
    emotion_quote: string[];
  }[];
}

// export interface RatingDict {
//   importance: number[];
//   conflict: number[];
//   sentiment: number[];
//   length: number[];
//   numChars: number[];
// }

export interface ChapterDivision {
  chapter: string;
  index: number;
  scenes: string[];
  locations: string[];
  characters: string[];
  groups: string[];
}

/* DATA */
const chapter_data = (all_data: any): Chapter[] => {
  const data = all_data["chapters"];

  if (!data) {
    return [];
  }
  data.forEach((chapter: any) => {
    chapter.numScenes = chapter.numScenes ? chapter.numScenes : chapter.scenes;
    chapter.numLines = chapter.numLines ? chapter.numLines : chapter.num_lines;
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
  let data = all_data["scenes"];

  // const max_characters_per_scene = Math.max(
  //   ...data.map((scene: any) => scene.characters.length)
  // );

  data.forEach((scene: any, i: number) => {
    // fix data inconsistencies
    scene.name = scene.name ? scene.name : scene.title;
    scene.number = i + 1;
    scene.numLines = scene.num_lines ? scene.num_lines : scene.numLines;
    scene.firstLine = scene.firstLine
      ? scene.firstLine
      : scene.first_line
      ? scene.first_line
      : 1;
    scene.lastLine = scene.lastLine
      ? scene.lastLine
      : scene.last_line
      ? scene.last_line
      : scene.numLines;
    // scene.text = scene.text ? scene.text : "";
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
      // replace importance rating for each character in scene.characters with 1 / num_characters
      character.importance_rank = character.importance_rank
        ? character.importance_rank
        : character.importance >= 1
        ? character.importance
        : character.importance * num_characters;
      // if (!character.importance || character.importance > 1) {
      character.importance =
        (num_characters - (character.importance_rank - 1)) / num_characters;
      character.rating = character.rating
        ? character.rating
        : character.sentiment
        ? character.sentiment
        : 0;
      all_sentiments.push(character.rating);
      character.role = character.role ? character.role : "";
      const og_quote = character.quote;
      character.quote = starts_or_ends_with_quote(og_quote)
        ? og_quote
        : '"' + og_quote + '"';
      const og_fake_quote = character.fake_quote;
      character.fake_quote =
        og_fake_quote && !og_fake_quote.includes("No quote available")
          ? og_fake_quote
          : og_fake_quote && !character.quote.includes("No quote available")
          ? character.quote
          : "";
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

// CHAPTER "SCENE" DATA
const chapter_scene_data = (
  chapter_data: Chapter[],
  scenes: Scene[]
): Scene[] => {
  const chapter_scenes = [] as Scene[];
  // const max_characters_per_chapter = Math.max(
  //   ...chapter_data.map((chapter) => Object.keys(chapter.characters).length)
  // );
  chapter_data.forEach((chapter, i) => {
    const new_scene = {} as Scene;
    new_scene.number = i + 1;
    new_scene.name = chapter.chapter;
    new_scene.chapter = chapter.chapter;
    new_scene.summary = chapter.summary;
    new_scene.numLines = chapter.numLines;
    new_scene.firstLine = 1;
    new_scene.lastLine = chapter.numLines;
    new_scene.numScenes = chapter.numScenes;

    const chap_locations = chapter.locations;
    // sort locations by number of scenes
    const sorted_locations = Object.entries(chap_locations)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: number });
    const sorted_loc_names = Object.keys(sorted_locations);
    // find location with the most scenes
    const location = sorted_loc_names[0];
    new_scene.location = location;
    new_scene.allLocations = sorted_locations;

    // find average sentiment of all scenes in chapter
    const chap_scenes = scenes.filter(
      (scene) => scene.chapter === chapter.chapter
    );

    let chap_links = [] as CharacterLink[];
    if (chapter.links) {
      chap_links = chapter.links;
    } else {
      chap_scenes.forEach((scene) => {
        // Iterate over each character pair only once
        scene.characters.forEach((scene_char, i) => {
          for (let j = i + 1; j < scene.characters.length; j++) {
            const scene_char2 = scene.characters[j];
            const link = chap_links.find(
              (l) =>
                (l.source === scene_char.name &&
                  l.target === scene_char2.name) ||
                (l.source === scene_char2.name && l.target === scene_char.name)
            );
            if (link) {
              link.value += 1;
            } else {
              chap_links.push({
                source: scene_char.name,
                target: scene_char2.name,
                value: 1,
              });
            }
          }
        });
      });
    }

    const sentiment =
      chap_scenes.reduce((a, b) => a + b.ratings.sentiment, 0) /
      chap_scenes.length;

    new_scene.ratings = {
      importance: chapter.importance,
      conflict: chapter.conflict,
      sentiment: sentiment,
    };

    const char_names = Object.keys(chapter.characters);
    const sorted_chars = char_names.sort(
      (a, b) => chapter.characters[b] - chapter.characters[a]
    );

    // find all scenes in chapter with this character
    const char_scenes = sorted_chars.map((char) => {
      const scenes_with_char = chap_scenes.filter((scene) =>
        scene.characters.some((scene_char) => scene_char.name === char)
      );
      const sorted_scenes = scenes_with_char.sort(
        (a, b) => a.ratings.importance - b.ratings.importance
      );

      // get the character's emotion, quote, and rating from the first scene
      const top_scene = sorted_scenes[0];
      const top_index =
        top_scene &&
        chap_scenes.findIndex((scene) => scene.number === top_scene.number);
      const c =
        top_scene &&
        top_scene.characters.find((scene_char) => scene_char.name === char);

      const quote = c
        ? starts_or_ends_with_quote(c.quote)
          ? c.quote
          : '"' + c.quote + '"'
        : "";
      const fake_quote = c && c.fake_quote ? c.fake_quote : "";
      return {
        emotion: c ? c.emotion : "",
        quote: quote,
        fake_quote: fake_quote,
        rating: c ? c.rating : 0,
        top_scene: top_index ? top_index + 1 : 1,
      };
    });

    new_scene.characters = sorted_chars.map((char, i) => {
      const imp = (sorted_chars.length + 1 - (i + 1)) / sorted_chars.length;
      return {
        name: char,
        importance: imp,
        importance_rank: i + 1,
        emotion: char_scenes[i].emotion,
        quote: char_scenes[i].quote,
        fake_quote: char_scenes[i].fake_quote,
        rating: char_scenes[i].rating,
        role: "",
        top_scene: char_scenes[i].top_scene,
        numScenes: chapter.characters[char] ? chapter.characters[char] : 0,
      };
    });

    new_scene.links = chap_links;
    chapter_scenes.push(new_scene);
  });
  return chapter_scenes;
};

/* LOCATION DATA */
// get all locations by finding unique location values
const locations = (data: Scene[]): string[] =>
  Array.from(new Set(data.map((scene) => scene.location)));

const location_data = (all_data: any): LocationData[] => {
  const locations = all_data["locations"];

  locations.forEach((location: any) => {
    location.quote = starts_or_ends_with_quote(location.quote)
      ? location.quote
      : '"' + location.quote + '"';
  });

  return locations;
};

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

    character.quote = starts_or_ends_with_quote(character.quote) // check if quote starts or ends with a quote
      ? character.quote
      : '"' + character.quote + '"';

    // remove extra fields
    delete character.name;
  });

  return characters;
};

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

      // but if index is -1, should be last
      if (aIndex === -1 && bIndex !== -1) {
        return 1;
      }
      if (bIndex === -1 && aIndex !== -1) {
        return -1;
      }

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

    // but if index is -1, should be last
    if (aIndex === -1 && bIndex !== -1) {
      return 1;
    }
    if (bIndex === -1 && aIndex !== -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  // recombine into a single array
  const flatSorted = sorted.flat();

  const no_color_characters = flatSorted.filter(
    (char: any) => !char.color || char.color === ""
  );
  // add color to characters without color
  // and replace white with a different color
  flatSorted.forEach((char: any) => {
    if (char.color && char.color === "rgb(255, 255, 255)") {
      char.color = "rgb(255, 240, 240)";
    } else if (!char.color || char.color === "") {
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

/* SCENE DATA */
// get all scene names using 'name' attribute in each scene object
// index corresponds to scene number
const scenes = (data: Scene[]): string[] => data.map((scene) => scene.name);

// map each scene to location
const sceneLocations = (data: Scene[]): string[] =>
  data.map((scene) => scene.location);

// split scene names into chunks of 30 characters
const sceneChunks = (scenes: string[], chapterView: boolean): string[][] =>
  scenes.map((scene) =>
    chapterView
      ? chunkQuote(extractChapterName(scene), 20)
      : chunkQuote(scene, 20)
  );

// list characters in each scene, sorted by their number of scenes
const sceneCharacters = (
  scenes: string[],
  data: Scene[],
  characterScenes: CharacterScene[],
  sortedCharacters: CharacterData[]
): SceneCharacter[] =>
  scenes.map((scene) => {
    // find characters in scene using data
    const dataScene = data.find((s) => s.name === scene) as any;
    const sortedChars = dataScene.characters
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
      });
    let groups = sortedChars.map(
      (char: string) =>
        sortedCharacters.find((c) => c.character === char)?.group || ""
    );
    // remove duplicates and empty strings
    groups = Array.from(new Set(groups)).filter((group) => group !== "");

    return {
      scene: scene,
      characters: sortedChars,
      groups: groups,
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
      const chunked = chunkQuote(
        starts_or_ends_with_quote(character.quote)
          ? character.quote
          : '"' + character.quote + '"',
        chunk_size
      );
      const fakeChunked = chunkQuote(
        character.fake_quote ? character.fake_quote : "",
        chunk_size
      );
      return {
        character: character.name,
        emotion_quote: chunked,
        fake_quote: fakeChunked,
      };
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
// const ratings = ["importance", "conflict", "sentiment", "length", "numChars"];
const createRatingDict = (data: Scene[]): any => {
  // const ratingDict: RatingDict = {} as any;

  const minMax = getMinMaxLines(data);
  const minLines = minMax[0];
  const maxLines = minMax[1];

  // const minCharacters = Math.min(
  //   ...data.map((scene) => scene.characters.length)
  // );
  // const maxCharacters = Math.max(
  //   ...data.map((scene) => scene.characters.length)
  // );

  // for (let rating of ratings) {
  //   const key = rating as keyof RatingDict;
  //   if (key === "length") {
  //     ratingDict[key] = data.map((scene) =>
  //       normalize(scene.numLines, minLines, maxLines, 0, 1)
  //     );
  //   } else if (key === "numChars") {
  //     ratingDict[key] = data.map((scene) =>
  //       normalize(scene.characters.length, minCharacters, maxCharacters, 0, 1)
  //     );
  //   } else {
  //     ratingDict[key] = data.map((scene) => scene.ratings[key]);
  //   }
  // }
  return {
    // ratingDict: ratingDict,
    minLines: minLines,
    maxLines: maxLines,
  };
};

// get chapter divisions by finding last instance of each unique chapter name
const getChapterDivisions = (
  data: Scene[],
  sortedCharacters: CharacterData[]
): ChapterDivision[] => {
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

    // find all groups in chapter
    const chapterGroups = Array.from(
      new Set(
        chapterCharacters.map(
          (char) =>
            sortedCharacters.find((c) => c.character === char)?.group || ""
        )
      )
    );

    return {
      chapter: chapter,
      index: firstSceneIndex,
      scenes: sceneNames,
      locations: chapterLocations,
      characters: chapterCharacters,
      groups: chapterGroups,
    };
  });

  return chapterDivisions;
};

// generate all data and return
export const getAllData = (
  init_data: any,
  chapterView: boolean,
  chapter: string = "",
  customAxisOptions: string[] = []
) => {
  const init_chapter_data = chapter_data(init_data);
  const sceneMinMax = getMinMaxLines(
    init_data["scenes"].map((d: any) => {
      const new_d = d;
      if (!new_d.numLines) {
        new_d.numLines = new_d.num_lines;
      }
      return new_d;
    })
  );
  const sceneMin = sceneMinMax[0];
  const sceneMax = sceneMinMax[1];

  let init_scene_data = scene_data(init_data, init_chapter_data);
  const og_scene_data = [...init_scene_data];
  const init_chapter_scene_data = chapter_scene_data(
    init_chapter_data,
    init_scene_data
  );

  const chapterMinMax = getMinMaxLines(
    init_chapter_scene_data.map((d: any) => {
      const new_d = d;
      if (!new_d.numLines) {
        new_d.numLines = new_d.num_lines;
      }
      return new_d;
    })
  );
  const chapterMin = chapterMinMax[0];
  const chapterMax = chapterMinMax[1];

  // update chapter data if custom y-axis options are set
  const new_chapter_data = [...init_chapter_scene_data];

  if (customAxisOptions.length > 0) {
    new_chapter_data.forEach((chapter) => {
      const scenes = init_scene_data.filter(
        (scene: any) => scene.chapter === chapter.chapter
      );
      const chapter_chars = chapter.characters;
      chapter_chars.forEach((char) => {
        const name = char.name;
        const char_scenes = scenes.filter((scene: any) =>
          scene.characters.map((c: any) => c.name).includes(name)
        );
        customAxisOptions.forEach((axis) => {
          const char_vals = char_scenes.map(
            (scene: any) =>
              scene.characters.find((c: any) => c.name === name)?.[axis]
          );
          const char_val =
            char_vals.reduce((a: number, b: number) => a + b, 0) /
            char_vals.length;
          char[axis] = char_val;
        });
      });

      // for each custom axis option, sort characters by that option
      const sortedDict = {} as { [key: string]: any[] };
      customAxisOptions.forEach((axis) => {
        sortedDict[axis] = chapter_chars
          .map((char) => ({ name: char.name, rating: char[axis] }))
          .sort((a, b) => a.rating - b.rating);
      });

      // now assign new vals to each character based on their rank in the sorted list
      customAxisOptions.forEach((axis) => {
        chapter_chars.forEach((char) => {
          const rank = sortedDict[axis].findIndex((c) => c.name === char.name);
          char[axis] = rank + 1;
        });
      });
    });
  }

  if (chapterView && init_chapter_scene_data.length > 0) {
    init_scene_data = [...init_chapter_scene_data];
  }

  if (chapter !== "") {
    init_scene_data = init_scene_data
      .filter((scene: any) => scene.chapter === chapter)
      .map((scene: any, i: number) => {
        scene.number = i + 1;
        return scene;
      });
  }

  const init_location_data = location_data(init_data);
  const init_character_data = character_data(init_data);

  const init_locations = locations(init_scene_data);
  const init_characters = characters(init_scene_data);
  const init_characterScenes = characterScenes(
    init_characters,
    init_scene_data
  );
  const init_sorted_characters = sortCharactersByGroup(
    init_character_data,
    init_characterScenes
  );

  const init_scenes = scenes(init_scene_data);
  const init_sceneLocations = sceneLocations(init_scene_data);
  const init_sceneChunks = sceneChunks(init_scenes, chapterView);
  const init_sceneCharacters = sceneCharacters(
    init_scenes,
    init_scene_data,
    init_characterScenes,
    init_sorted_characters
  );
  const init_sceneSummaries = sceneSummaries(init_scene_data);

  const rating_info = createRatingDict(init_scene_data);
  const minLines = rating_info.minLines;
  const maxLines = rating_info.maxLines;

  const chapterDivisions = getChapterDivisions(
    init_scene_data,
    init_sorted_characters
  );
  const num_chapters = chapterDivisions.length;

  return {
    scene_data: init_scene_data,
    og_scene_data: og_scene_data,
    chapter_data: init_chapter_scene_data,
    location_data: init_location_data,
    character_data: init_character_data,
    locations: init_locations,
    characters: init_characters,
    characterScenes: init_characterScenes,
    sortedCharacters: init_sorted_characters,
    scenes: init_scenes,
    sceneLocations: init_sceneLocations,
    sceneChunks: init_sceneChunks,
    sceneCharacters: init_sceneCharacters,
    sceneSummaries: init_sceneSummaries,
    minLines: minLines,
    maxLines: maxLines,
    sceneMin: sceneMin,
    sceneMax: sceneMax,
    chapterMin: chapterMin,
    chapterMax: chapterMax,
    chapterDivisions: chapterDivisions,
    num_chapters: num_chapters,
  };
};
