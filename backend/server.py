from flask import Flask, jsonify, request
from flask_cors import CORS
from prompts import assign_character_attributes
from helpers import load_model


# load the model
llm = load_model()

# start the server
app = Flask(__name__)
CORS(app)
print("Server started.")


@app.route("/new_colors", methods=['GET'])
def add_new_colors():
    print("Adding new colors...")
    data = request.args.get('data')
    # print("Data:", data)
    color_desc = request.args.get('color_desc')
    print("Color description:", color_desc)
    story_type = request.args.get('story_type')
    print("Story type:", story_type)
    char_attrs, color_assignments = assign_character_attributes(llm, data, color_desc, story_type)
    # print("Character attributes:", char_attrs)
    # print("Color assignments:", color_assignments)
    print("Colors added.")
    print("*" * 50)
    return jsonify({"char_attrs": char_attrs, "color_assignments": color_assignments})

@app.route("/status", methods=['GET'])
def status():
    return jsonify({"status": "ok"})

@app.route("/")
def base():
    return "backend"

if __name__ == "__main__":
    print("Starting Flask server...")
    print("-------------------------")
    app.run(debug=True, port=5000)