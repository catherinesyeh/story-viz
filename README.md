# story-viz

Visualizing storylines with LLM assistance

## setup

### secrets file

- duplicate `.env_example` file and rename to `.env`
- fill in env variables

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

the server should not be running at [`127.0.0.1:5000`](http://127.0.0.1:5000)
