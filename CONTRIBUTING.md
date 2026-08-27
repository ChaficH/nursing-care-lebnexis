# Contributing

This guide shows you how to get the project running, make changes, and push them to the repository.

The goal is to keep the process simple.

## 1. Get the Project

Clone the repository:

```bash
git clone https://github.com/ChaficH/nursing-care-lebnexis.git
cd nursing-care-lebnexis
```

If you already cloned it before:

```bash
cd nursing-care-lebnexis
git pull origin main
```

## 2. Start the Project

Make sure **Docker Desktop is running**.

Create your local environment file:

```bash
cp .env.example .env
```

Then start the project:

```bash
docker compose up --build
```

Wait until the containers finish starting.

You should have:

```text
Backend:    http://localhost:3000
ML Service: http://localhost:8000
Database:   localhost:5432
```

To stop the project:

```bash
docker compose down
```

## 3. Where Do I Edit?

Look at the project structure:

```text
nursing-care-lebnexis/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
│
├── ml-backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
│
└── docker-compose.yml
```

### Backend work

Edit files inside:

```text
backend/
```

The current backend entry point is:

```text
backend/index.js
```

### ML / Python work

Edit files inside:

```text
ml-backend/
```

### Docker configuration

The main Docker configuration is:

```text
docker-compose.yml
```

Only change this if you actually need to modify how the services run.

## 4. Make Your Changes

Open the project in your editor.

For example, with VS Code:

```bash
code .
```

Then edit the files you need.

You do **not** need to create another copy of the project.

Everyone works on the same repository.

## 5. Test Your Changes

After making your changes, make sure Docker is still working:

```bash
docker compose up --build
```

Check the relevant service.

For example:

```text
http://localhost:3000
```

or:

```text
http://localhost:8000/health
```

If you changed the backend, test the backend.

If you changed the ML service, test the ML service.

## 6. Check What You Changed

Before committing:

```bash
git status
```

You will see the files you changed.

You can also see the actual changes:

```bash
git diff
```

Make sure you are not accidentally committing things such as:

```text
.env
```

or temporary files.

## 7. Commit Your Changes

Add your changes:

```bash
git add .
```

Create a commit:

```bash
git commit -m "Describe what you changed"
```

For example:

```bash
git commit -m "Add patient request endpoint"
```

or:

```bash
git commit -m "Update provider matching logic"
```

## 8. Push to Main

Before pushing, get the latest version of `main`:

```bash
git pull --rebase origin main
```

If everything is fine:

```bash
git push origin main
```

That's it.

Your changes are now on the repository.

## 9. If Git Says There Are Conflicts

If another teammate pushed changes before you, Git may report a conflict.

Do not randomly delete files or overwrite their work.

Run:

```bash
git status
```

Git will tell you which files have conflicts.

If you are unsure how to resolve them, ask the team before continuing.

## 10. The Normal Workflow

For most changes, your workflow is simply:

```bash
cd nursing-care-lebnexis

git pull --rebase origin main

docker compose up --build

# Edit your files

git status
git add .
git commit -m "Describe your changes"
git pull --rebase origin main
git push origin main
```

## 11. Important Rules

* Do not commit `.env`
* Do not commit passwords or API keys
* Do not delete another person's work
* Pull the latest `main` before starting
* Test your changes before pushing
* Keep commit messages clear
* If you change dependencies, rebuild Docker
* If you are unsure about a major structural change, ask the team first

That's all you need to start contributing.
