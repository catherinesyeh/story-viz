from helpers import load_model
from prompts import add_yaxis_data, assign_character_attributes
import json

# start main method


def main():
    # load the model
    llm = load_model()

    # story
    story = "gatsby"
    print(f"Running prompts for {story}...\n")

    # load data
    with open(f"../src/data/{story}.json") as f:
        data = json.load(f)

    # get character data
    charData = data["characters"]

    # get scene data
    sceneData = data["scenes"]

    # color
    color = "gender"

    # y-axis
    y_axis = "happiness"

    # convert charData to JSON string
    charData = json.dumps(charData)

    # convert sceneData to JSON string
    sceneData = json.dumps(sceneData)

    # test assinging character attributes + colors
    char_attrs, color_assignments = assign_character_attributes(
        llm, charData, color, "character")

    print("Character attributes:")
    print(char_attrs)
    print("\nColor assignments:")
    print(color_assignments)

    # test adding y-axis data
    # new_data = add_yaxis_data(llm, sceneData, y_axis, "character")

    # print("New data:")
    # print(new_data)


if __name__ == "__main__":
    main()
