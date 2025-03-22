# story-viz

Visualizing storylines with LLM assistance

## setup

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

- if something went wrong, you may have to adjust the extracted first line, last line, and/or markers manually in the created `summary.json` file in the [notebooks/json/](notebooks/json/) folder (e.g., `notebooks/json/gatsby/summary.json`).
- or you can try modifying the code in this section to parse the chapters correctly.
- in either case, after making your changes, rerun this block of code until the chapter txt files look correct.

6. run the rest of the code in this notebook, starting from the **analyze scene** section.

- hopefully this part should run smoothly, but the notebook is roughly divided into semantic subsections to help with debugging.
- if something goes wrong, you may need to adjust the code.

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
