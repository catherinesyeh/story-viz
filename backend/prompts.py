from pydantic import BaseModel, Field
import json
import asyncio

# Pydantic
# COLORS


class CategoryList(BaseModel):
    """List of categories for an attribute"""
    categories: list[str] = Field(
        description="List of categories for the attribute")


class CharacterAttribute(BaseModel):
    """Assigns an attribute value to a character"""
    character: str = Field(description="The character to assign a color to")
    attrVal: str = Field(
        description="The value of the attribute to assign to the character")
    explanation: str = Field(
        description="Explanation of why the character was assigned this attribute value")


class CharacterAttributes(BaseModel):
    """List of attributes for all characters"""
    characters: list[CharacterAttribute] = Field(
        description="List of characters and their attributes")


class ThemeAttribute(BaseModel):
    """Assigns an attribute value to a theme"""
    character: str = Field(description="The theme to assign a color to")
    attrVal: str = Field(
        description="The value of the attribute to assign to the theme")
    explanation: str = Field(
        description="Explanation of why the theme was assigned this attribute value")


class ThemeAttributes(BaseModel):
    """List of attributes for all themes"""
    characters: list[CharacterAttribute] = Field(
        description="List of themes and their attributes")


class ColorAssignment(BaseModel):
    """Assigns a color for each unique attribute value"""
    attrVal: str = Field(
        description="The value of the attribute to assign a color to")
    color: str = Field(description="Unique RGB color string that represents this attribute value (e.g., rgb(118, 185, 71)). Every attribute value should have a different color. Don't use white and make sure the color is visible against a white background (e.g., not too light or bright).")


class ColorAssignments(BaseModel):
    """List of colors for each attribute value"""
    colors: list[ColorAssignment] = Field(
        description="List of colors for each attribute value. Make sure there is exactly one entry per attribute value in the provided list and no additional attribute values are added. Choose a different color for each attribute value.")


MAX_CHARS_PER_ROUND = 10

# Y-AXIS


class SceneCharacter(BaseModel):
    """Assigns rating to a character in a scene"""
    character: str = Field(description="The character to assign a rating to")
    rating: float = Field(
        description="The rating (between 0 to 1) to assign to this character")


class SceneCharacters(BaseModel):
    """List of ratings for all characters in a scene"""
    characters: list[SceneCharacter] = Field(
        description="List of characters and their ratings in this scene")


class SceneTheme(BaseModel):
    """Assigns rating to a theme in a scene"""
    character: str = Field(description="The theme to assign a rating to")
    rating: float = Field(
        description="The rating (between 0 to 1) to assign to this theme")


class SceneThemes(BaseModel):
    """List of ratings for all themes in a scene"""
    characters: list[SceneTheme] = Field(
        description="List of themes and their ratings in this scene")

# FINDING CHAPTER TO ANSWER QUESTION


class ChapterAnswer(BaseModel):
    """Assigns a chapter to answer a question"""
    chapter: str = Field(
        description="The chapter that contains the answer to the question")
    explanation: str = Field(
        description="Brief explanation of why this chapter contains the answer to the question")

# Assign values to characters for the given attribute


async def assign_character_attributes_async(llm, charData, attr, palette_info, story_type):
    char_llm = llm.with_structured_output(
        CharacterAttributes if story_type == "character" else ThemeAttributes)

    # convert charData to JSON if string
    if isinstance(charData, str):
        print("Converting charData to JSON...")
        charData = json.loads(charData)

    # generate categories
    category_prompt = f"""
        Your job is to come up with a list of possible values for the attribute: "{attr}".

        If the attribute is categorical, list categories that multiple {story_type}s could fall into.
        (e.g., "male", "female", "n/a" or "happy", "sad", "angry", "tired", etc.).

        If the attribute is continuous, list ranges that multiple {story_type}s could fall into.
        Make sure the ranges don't overlap.
        (e.g., "low", "medium", "high" or "0-10", "11-20", "21-30", "31-40", etc.).

        In either case, limit the total number of unique values as much as possible.
    """

    category_llm = llm.with_structured_output(CategoryList)
    category_results = await category_llm.ainvoke(category_prompt)
    categories = category_results.categories

    print(f"Categories: {categories}")

    # split the characters into groups of MAX_CHARS_PER_ROUND
    split_charData = [charData[i:i + MAX_CHARS_PER_ROUND]
                      for i in range(0, len(charData), MAX_CHARS_PER_ROUND)]

    print(f"Split into {len(split_charData)} rounds")

    async def process_batch(batch):
        """Asynchronously process a batch of characters"""
        prompt = f"""
                Assign each {story_type} in this list a value for the attribute: "{attr}",
                only picking from this set of possible values: {categories}.
                If the {story_type} doesn't fit any of the categories, label it as "n/a" or "other".

                {story_type}s:
                {batch}
                """
        print("Running batch...")
        return await char_llm.ainvoke(prompt)

    # Run LLM calls concurrently
    tasks = [process_batch(batch) for batch in split_charData]
    results_list = await asyncio.gather(*tasks)

    char_attrs = []
    unique_attrs = []
    # format as JSON and add to char_attrs
    for res in results_list:
        for char in res.characters:
            attr_val = char.attrVal
            if attr_val not in unique_attrs:
                unique_attrs.append(attr_val)
            char_attrs.append({"character": char.character,
                              "val": attr_val, "exp": char.explanation})
    # print(char_attrs)

    # generate colors for each unique attribute value
    color_llm = llm.with_structured_output(ColorAssignments)
    palette_prompt = f"""Choose colors based on this palette: {palette_info}."""
    color_prompt = f"""
            Assign a color for each unique value of the attribute: "{attr}".
            {palette_prompt if palette_info else ""}

            Unique attribute values:
            {unique_attrs}
            """
    colors = await color_llm.ainvoke(color_prompt)

    # format as JSON
    color_assignments = []
    for color in colors.colors:
        color_assignments.append({"val": color.attrVal, "color": color.color})
    # print(color_assignments)

    # sort color_assignments based on categories if the val is in categories, otherwise put it at the end
    color_assignments.sort(key=lambda x: categories.index(
        x["val"]) if x["val"] in categories else len(categories
                                                     ))

    sorted_keys = [x["val"] for x in color_assignments]
    print("Sorted unique vals:", sorted_keys
          )

    return char_attrs, color_assignments

# Wrapper function for async character attribute function


def assign_character_attributes(llm, charData, attr, palette_info, story_type):
    return asyncio.run(assign_character_attributes_async(llm, charData, attr, palette_info, story_type))


async def add_yaxis_data_async(llm, sceneData, y_axis, story_type):
    scene_llm = llm.with_structured_output(
        SceneCharacters if story_type == "character" else SceneThemes)

    # convert sceneData to JSON if string
    if isinstance(sceneData, str):
        print("Converting sceneData to JSON...")
        sceneData = json.loads(sceneData)

    print(f"Adding y-axis data for {len(sceneData)} scenes")

    async def process_scene(scene):
        """Asynchronously process a scene"""
        prompt = f"""
        Assign each {story_type} a rating between 0: least {y_axis} to 1: most {y_axis} for this scene,
        based on the provided information.
        Make sure to assign a rating to every {story_type}, and don't add any new {story_type}s.

        Scene:
        {scene}
        """
        print(f"Running scene...")
        return await scene_llm.ainvoke(prompt)

    # Run LLM calls concurrently
    tasks = [process_scene(sd) for sd in sceneData]
    results_list = await asyncio.gather(*tasks)

    # copy sceneData
    new_data = sceneData.copy()

    # add character ratings
    for scene, result in zip(new_data, results_list):
        # update sd with character ratings
        for c in result.characters:
            char_name = c.character
            rating = c.rating
            # find character in this_scene_data
            scene_character = next(
                (ch for ch in scene["characters"] if ch["name"] == char_name), None)
            if scene_character:
                scene_character[y_axis] = rating

        # rank characters based on rating
        character_ratings = []
        for k, character in enumerate(scene["characters"]):
            character_ratings.append(
                (k, character[y_axis] if y_axis in character else 0))
        # sort character ratings
        sorted_character_ratings = sorted(
            character_ratings, key=lambda x: x[1], reverse=True)
        # replace rating with rank
        for k, (l, _) in enumerate(sorted_character_ratings):
            scene["characters"][l][y_axis] = k + 1

    return new_data

# Wrapper function for async y-axis function


def add_yaxis_data(llm, sceneData, y_axis, story_type):
    return asyncio.run(add_yaxis_data_async(llm, sceneData, y_axis, story_type))

# General Q/A


def ask_question(llm, data, question):
    prompt = f"""
            Answer this question: "{question}" using only the provided information:
        
            {data}

            Keep your answer brief, using 1-2 sentences max.
            """

    response = llm.invoke(prompt)
    answer = response.content
    return answer

# Find the chapter that contains the answer to the question


def find_chapter(llm, data, question):
    prompt = f"""
            Identify which chapter can answer this question: "{question}"
            Use the exact chapter name found in the "chapter" field of the data
            (e.g., "Chapter 1: The Beginning" or "XVII.").

            Chapter data:
            {data}

            If the question is not relevant to this story (e.g., asks about 
            characters who don't exist), or you can't find the answer in any 
            chapter, write "N/A" for the chapter and explanation.
            """

    chapter_llm = llm.with_structured_output(ChapterAnswer)
    response = chapter_llm.invoke(prompt)
    chapter = response.chapter
    explanation = response.explanation

    return chapter, explanation
