# Story Ribbons: Reimagining Storyline Visualizations with LLMs

<img width="2960" height="1064" alt="image" src="https://github.com/user-attachments/assets/faea75e3-5fed-4749-ac58-9841599afcc0" />

* Paper: [https://arxiv.org/abs/2508.06772](https://arxiv.org/abs/2508.06772)
* Demo: [https://catherinesyeh.github.io/story-demo/](https://catherinesyeh.github.io/story-demo/)
* Docs: [https://catherinesyeh.github.io/story-docs/](https://catherinesyeh.github.io/story-docs/)

## abstract
> Analyzing literature involves tracking interactions between characters, locations, and themes. Visualization has the potential to facilitate the mapping and analysis of these complex relationships, but capturing structured information from unstructured story data remains a challenge. As large language models (LLMs) continue to advance, we see an opportunity to use their text processing and analysis capabilities to augment and reimagine existing storyline visualization techniques. Toward this goal, we introduce an LLM-driven data parsing pipeline that automatically extracts relevant narrative information from novels and scripts. We then apply this pipeline to create Story Ribbons, an interactive visualization system that helps novice and expert literary analysts explore detailed character and theme trajectories at multiple narrative levels. Through pipeline evaluations and user studies with Story Ribbons on 36 literary works, we demonstrate the potential of LLMs to streamline narrative visualization creation and reveal new insights about familiar stories. We also describe current limitations of AI-based systems, and interaction motifs designed to address these issues.

## setup instructions

### env/secrets file

- duplicate `.env_example` and rename to `.env`
  - fill in env variables
- duplicate `secrets_example.json` and rename to `secrets.json`
  - fill in api keys

### install requirements

install pipenv if you don't have it:

```
pip install pipenv
```

build requirements for project:

```
pipenv install
```

start virtual env:

```
pipenv shell
```

## run frontend

### dev

install dependencies (1st run only):

```
yarn install
```

run development server:

```
yarn dev
```

the interface should now be live at [`localhost:5200`](http://localhost:5200)

### build (only run for production)

```
yarn build
```

access files in `dist` folder

## backend

**note:** make sure your pipenv environment is active (see above)

in a separate terminal, navigate to [backend/](backend/) folder:

```
cd backend
```

start the backend server

```
python server.py
```

the server should now be running at [`127.0.0.1:5000`](http://127.0.0.1:5000)

## adding new stories

1. open [notebooks/parsing_data.ipynb](notebooks/parsing-data.ipynb). run the notebook until the end of the **setup** section.

2. make sure these folders have been created inside of the [notebooks/](notebooks/) folder. if not, add them:

   - [notebooks/scripts/](notebooks/scripts/)
   - [notebooks/chapters/](notebooks/chapters/)
   - [notebooks/json/](notebooks/json/)

3. add your story text file inside the [notebooks/scripts/](notebooks/scripts/) folder. currently, only `.txt` files are supported. name your file something short but representative of your story's title (e.g., "gatsby.txt" for The Great Gatsby).

4. in the first cell under the **split text into chapters** section in [notebooks/parsing_data.ipynb](notebooks/parsing-data.ipynb), set `og_story_name` to your filename without the ".txt" (e.g., "gatsby").

- you can also change the `analysis_type` here (e.g., "character" or "theme"). we recommend trying "character" first.

- the cell should look something like this:

```
og_story_name = "gatsby"
story_name = og_story_name
analysis_type = "character"
```

5. run the rest of the code in this section, stopping at **analyze scene**. double check the generated chapter txt files which should be located in the [notebooks/chapters/](notebooks/chapters/) folder inside a subfolder corresponding to your story name (e.g., `notebooks/chapters/gatsby/`).

**note: this is the only step in the pipeline that may require manual intervention.**

- if something went wrong, you may have to adjust the extracted first line, last line, and/or markers manually in the created `summary.json` file in the [notebooks/json/](notebooks/json/) folder (e.g., `notebooks/json/gatsby/summary.json`).
- after making changes, rerun this block of code until the chapter txt files look correct.

6. run the rest of the code in this notebook, starting from the **analyze scene** section.

- this part should run smoothly, but the notebook is roughly divided into semantic subsections to help with debugging.

7. at the end of the notebook, _after_ running the final **generating the final json file** section, you should see a `final_data.json` file in the subfolder corresponding to your story in [notebooks/json/](notebooks/json/) (e.g., `notebooks/json/gatsby/final_data.json`).

8. you should also see a corresponding json file in the [src/data/](src/data/) folder. for _character_ analyses, your file will be named `yourstory-new.json` (e.g., "gatsby-new.json") and for _theme_ analyses, your file will be named `yourstory-new-themes.json` (e.g., "gatsby-new-themes.json").

- **if you do not see this file**, take your `final_data.json` file and copy and paste it into the [src/data/](src/data/) folder. rename the file accordingly following the instructions above.

9. also check if you see a corresponding folder for your story in the [public/chapters/](public/chapters/) folder (e.g., `public/chapters/gatsby/`) with the chapter `.txt` files.

- **if you do not see this folder or it is empty**, copy your story's full chapter folder in [notebooks/chapters/](notebooks/chapters/) (e.g., `notebooks/chapters/gatsby/`) and paste it inside the [public/chapters/](public/chapters/) folder.

10. in [src/components/Header/PlotOptions.tsx](src/components/Header/PlotOptions.tsx), add your file name to the `storyOptions` list. it should look something like this:

```
const storyOptions = [
    "gatsby-new",
    "gatsby-new-themes",
    ...
];
```

11. save your changes and run the frontend again at [`localhost:5200`](http://localhost:5200) (see more detailed instructions above). you should be able to select your story from the dropdown menu and see your visualization results!

## citation
If you find this work helpful, please consider citing our paper:
```
@article{yeh2025story,
  title={Story Ribbons: Reimagining Storyline Visualizations with Large Language Models},
  author={Yeh, Catherine and Menon, Tara and Arya, Robin Singh and He, Helen and Weigel, Moira and Vi{\'e}gas, Fernanda and Wattenberg, Martin},
  journal={IEEE Transactions on Visualization and Computer Graphics},
  year={2025},
  publisher={IEEE}
}
```
Thank you for checking out Story Ribbons!
