from flask import Flask, jsonify, request
from flask_cors import CORS
from prompts import add_yaxis_data, ask_question, assign_character_attributes, find_chapter
from helpers import load_model
import time


# load the model
llm = load_model()

# start the server
app = Flask(__name__)
CORS(app)
print("Server started.")


@app.route("/new_colors", methods=['POST'])
def add_new_colors():
    print("Adding new colors...")
    payload = request.json
    data = payload.get('data')
    # print("Data:", data)
    color_desc = payload.get('color_desc')
    print("Color description:", color_desc)
    palette_info = payload.get('palette_info')
    print("Palette info:", palette_info)
    story_type = payload.get('story_type')
    print("Story type:", story_type)
    start_time = time.time()
    char_attrs, color_assignments = assign_character_attributes(
        llm, data, color_desc, palette_info, story_type)
    # print("Character attributes:", char_attrs)
    # print("Color assignments:", color_assignments)
    end_time = time.time()
    print(f"Colors added in {end_time - start_time} seconds.")
    print("*" * 50)
    return jsonify({"char_attrs": char_attrs, "color_assignments": color_assignments})


@app.route("/new_yaxis", methods=['POST'])
def add_new_yaxis():
    print("Adding new y-axis...")
    payload = request.json
    data = payload.get('data')
    # print("Data:", data)
    yaxis_desc = payload.get('yaxis_desc')
    print("Y-axis:", yaxis_desc)
    story_type = payload.get('story_type')
    print("Story type:", story_type)
    start_time = time.time()
    new_data = add_yaxis_data(llm, data, yaxis_desc, story_type)
    end_time = time.time()
    print(f"Y-axis added in {end_time - start_time} seconds.")
    print("*" * 50)
    return jsonify({"new_data": new_data})


@app.route("/ask_llm", methods=['POST'])
def ask_llm():
    payload = request.json
    question = payload.get('question')
    print("Question:", question)
    data = payload.get('data')
    # print("Data:", data)
    start_time = time.time()
    answer = ask_question(llm, data, question)
    end_time = time.time()
    print(f"Response generated in {end_time - start_time} seconds.")
    print("*" * 50)
    return jsonify({"answer": answer})


@app.route("/find_chapter_with_llm", methods=['POST'])
def find_chapter_with_llm():
    payload = request.json
    question = payload.get('question')
    print("Question:", question)
    data = payload.get('data')
    # print("Data:", data)
    start_time = time.time()
    chapter, explanation = find_chapter(llm, data, question)
    end_time = time.time()
    print(f"Response generated in {end_time - start_time} seconds.")
    print("*" * 50)
    return jsonify({"chapter": chapter, "explanation": explanation})


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
