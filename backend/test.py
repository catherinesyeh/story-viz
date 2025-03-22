from helpers import load_model
from prompts import add_yaxis_data, ask_question, assign_character_attributes, find_chapter
import json

# start main method


def main():
    # load the model
    llm = load_model()

    # story
    story = "gatsby-new"
    print(f"Running prompts for {story}...\n")

    # load data
    with open(f"../src/data/{story}.json") as f:
        data = json.load(f)

    # get character data
    charData = data["characters"]

    # get chapter data
    chapterData = data["chapters"]

    # get scene data
    sceneData = data["scenes"]

    # color
    color = "gender"
    palette_info = "purples"

    # y-axis
    y_axis = "happiness"

    # convert charData to JSON string
    charData = json.dumps(charData)

    # convert first scene to JSON string
    firstScene = sceneData[0]["text"]

    # convert sceneData to JSON string
    sceneData = json.dumps(sceneData)

    # TEST ONE: test assinging character attributes + colors
    char_attrs, color_assignments = assign_character_attributes(
        llm, charData, color, palette_info, "character")

    print("Character attributes:")
    print(char_attrs)
    print("\nColor assignments:")
    print(color_assignments)

    # TEST TWO: test adding y-axis data
    # new_data = add_yaxis_data(llm, sceneData, y_axis, "character")

    # print("New data:")
    # print(new_data)

    # # TEST THREE: test asking question
    # question = "Why is Nick the most important character in this scene?"
    # answer = ask_question(llm, firstScene, question)
    # print(f"Question: {question}")
    # print(f"Answer: {answer}")

    # TEST FOUR: test finding chapter to answer question
    # question = "When does Nick fist meet Jordan?"
    # chapter, explanation = find_chapter(llm, chapterData, question)
    # print(f"Question: {question}")
    # print(f"Chapter: {chapter}")
    # print(f"Explanation: {explanation}")


if __name__ == "__main__":
    main()
