// read in data from data folder
import all_data from "../data/gatsby.json";

/* HELPERS */
// create generic chunk method
// I:  - quote (string): quote to be split into chunks
//     - chunk_size (number): maximum number of characters in each chunk
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

/* DATA */
export const title = all_data["title"];
export const data = all_data["scenes"];
export const location_data = all_data["locations"];
export const character_data = all_data["characters"];

/* LOCATION DATA */
// get all locations by finding unique 'group' values in location object
export const locations = Array.from(
  new Set(data.map((scene: any) => scene.location.group))
);

// for each quote in location_data, split quote into chunk_size character chunks, making sure to keep full words
export const location_quotes = location_data.map((location: any) => {
  const chunked = chunkQuote('"' + location.quote + '"', 80);
  return {
    location: location.group,
    quote: chunked,
  };
});

// also chunk the location names
export const location_chunks = location_data.map((location: any) => {
  return chunkQuote(location.group, 24);
});

/* CHARACTER DATA */
// get all characters by finding unique 'name' values in characters object
export const characters = Array.from(
  new Set(
    data.flatMap((scene: any) =>
      scene.characters.map((character: any) => character.name)
    )
  )
);

// for each character, get all scenes they appear in
// sort by number of scenes they appear in (descending order)
export const characterScenes = characters
  .map((character: any) => {
    return {
      character: character,
      scenes: data
        .filter((scene: any) =>
          scene.characters.some(
            (char: any) => char.name.toLowerCase() === character.toLowerCase()
          )
        )
        .map((scene: any) => scene.number - 1),
      // also get all locations this character appears in
      locations: data
        .filter((scene: any) =>
          scene.characters.some(
            (char: any) => char.name.toLowerCase() === character.toLowerCase()
          )
        )
        .map((scene: any) => scene.location.group),
    };
  })
  .sort((a, b) => b.scenes.length - a.scenes.length);

export const reverseCharacterNames = characterScenes.slice().reverse();

// for each quote in character-data, split quote into chunk_size character chunks, making sure to keep full words
export const character_quotes = character_data
  .map((character: any) => {
    const chunked = chunkQuote('"' + character.quote + '"', 80);
    return {
      character: character.character,
      quote: chunked,
    };
  })
  .sort((a: any, b: any) => {
    // sort by the order in characterScenes
    const aIndex = characterScenes.findIndex(
      (charScene: any) =>
        charScene.character.toLowerCase() === a.character.toLowerCase()
    );
    const bIndex = characterScenes.findIndex(
      (charScene: any) =>
        charScene.character.toLowerCase() === b.character.toLowerCase()
    );
    return aIndex - bIndex;
  });

/* SCENE DATA */
// get all scene names using 'name' attribute in each scene object
// index corresponds to scene number
export const scenes = data.map((scene: any) => scene.name);

// map each scene to location
export const sceneLocations = data.map((scene: any) => scene.location.group);

// split scene names into chunks of 30 characters
export const sceneChunks = scenes.map((scene: any) => chunkQuote(scene, 24));

// list characters in each scene, sorted by their number of scenes
export const sceneCharacters = scenes.map((scene: any) => {
  // find characters in scene using data
  const dataScene = data.find((s: any) => s.name === scene) as any;
  return {
    scene: scene,
    characters: dataScene.characters
      .map((char: any) => char.name)
      .sort((a: any, b: any) => {
        // find index of character in characterScenes
        const aIndex = characterScenes.findIndex(
          (charScene: any) =>
            charScene.character.toLowerCase() === a.toLowerCase()
        );
        const bIndex = characterScenes.findIndex(
          (charScene: any) =>
            charScene.character.toLowerCase() === b.toLowerCase()
        );
        return aIndex - bIndex;
      }),
  };
});

// split scene summaries into chunks of 105 characters
export const sceneSummaries = data.map((scene: any) => {
  // also chunk each character's quote for the first emotion in their emotions list
  // save in a dictionary with character name as key
  const chunk_size = 105;
  const chunkedEmotions = scene.characters.map((character: any) => {
    const chunked = chunkQuote('"' + character.emotion.quote + '"', chunk_size);
    return { character: character.name, emotion_quote: chunked };
  });

  // sort chunked emotions by the order in characterScenes
  const sortedEmotions = chunkedEmotions.sort((a: any, b: any) => {
    const aIndex = characterScenes.findIndex(
      (charScene: any) =>
        charScene.character.toLowerCase() === a.character.toLowerCase()
    );
    const bIndex = characterScenes.findIndex(
      (charScene: any) =>
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

// create dictionary with importance, conflict, and emotion ratings, each containing a list of ratings by scene
const ratings = ["importance", "conflict", "emotion"];
export const ratingDict = {} as any;
for (let rating of ratings) {
  ratingDict[rating] = data.map((scene: any) => scene.ratings[rating]);
}
