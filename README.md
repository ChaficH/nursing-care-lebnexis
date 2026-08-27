# Smart Home Healthcare Platform

A web platform that connects patients and families with home healthcare providers such as nurses, physiotherapists, and mental health professionals.

The platform uses patient requests, provider information, location, availability, and AI-assisted categorization to help connect patients with suitable home healthcare providers.

> Built as part of the **LebNexis Career Launch – Web Development Program**.

---

## How It Works

**Patient describes their needs → AI helps categorize the request → suitable providers are found → patient requests a provider.**

The AI assists with categorization and matching. It **does not diagnose medical conditions**.

---

## Planned Features

* Patient registration and profiles
* Healthcare provider registration and profiles
* Patient care requests
* AI-assisted request categorization
* Provider matching
* Location-based matching
* Provider availability
* Appointment requests
* Accept/reject appointment workflow
* Cash payments for the initial MVP

---

## Tech Stack

* **Frontend:** React / Next.js
* **Backend:** Node.js / Express
* **AI / ML:** Python / FastAPI
* **Database:** PostgreSQL
* **Development:** Docker / Docker Compose
* **Version Control:** Git / GitHub

The stack may change as development continues.

---

# Getting Started

## Requirements

Install these two things:

* Git
* Docker Desktop

You **do not** need to install Node.js, Python, or PostgreSQL separately.

Docker handles the development environment for you.

---

## 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/ChaficH/nursing-care-lebnexis.git
cd nursing-care-lebnexis
```

---

## 2. Create Your Environment File

Create your local `.env` file from the example:

### macOS / Linux / Git Bash

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Do **not** commit your `.env` file to GitHub.

---

## 3. Start the Project

Make sure Docker Desktop is running.

Then run:

```bash
docker compose up --build
```

The first time you run this, Docker will download the required images and build the services. This can take a few minutes.

Once everything starts, the project will have three services:

```text
Backend       → http://localhost:3000
ML Service    → http://localhost:8000
PostgreSQL    → localhost:5432
```

---

# Checking That Everything Works

### Backend

Open:

```text
http://localhost:3000
```

### Database connection

Open:

```text
http://localhost:3000/health/db
```

### ML service

Open:

```text
http://localhost:8000/health
```

### ML service through the backend

Open:

```text
http://localhost:3000/health/ml
```

If these services respond correctly, your local environment is working.

---

# Project Structure

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
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

### `backend/`

This is the Node.js / Express backend.

Most backend development will happen here.

For example:

```text
backend/index.js
```

### `ml-backend/`

This is the Python / FastAPI service.

Python dependencies are listed in:

```text
ml-backend/requirements.txt
```

### `docker-compose.yml`

This controls how the backend, ML service, and PostgreSQL database run together.

---

# Making Changes

Open the project in your preferred code editor.

For VS Code:

```bash
code .
```

Then edit the files you need.

### Backend changes

Work inside:

```text
backend/
```

### AI / ML changes

Work inside:

```text
ml-backend/
```

### Docker changes

Edit:

```text
docker-compose.yml
```

Only modify Docker configuration when necessary.

---

# Do I Need to Rebuild Docker?

### Normal code changes

For normal changes to `.js` or `.py` files, you generally do **not** need to rebuild the images.

Just save your changes and restart the relevant service if necessary.

### Dependency changes

If you change:

```text
backend/package.json
```

or:

```text
ml-backend/requirements.txt
```

rebuild Docker:

```bash
docker compose up --build
```

---

# Git Workflow

Everyone on the team should have **Write access** to the repository.

The workflow is simple:

```text
Pull → Edit → Test → Commit → Pull → Push
```

## Before Starting Work

Always get the latest version:

```bash
git pull origin main
```

---

## After Making Changes

Check what changed:

```bash
git status
```

To see the actual changes:

```bash
git diff
```

---

## Save Your Changes

Add the files:

```bash
git add .
```

Then create a commit:

```bash
git commit -m "Describe what you changed"
```

Examples:

```bash
git commit -m "Add patient request endpoint"
```

```bash
git commit -m "Update provider matching"
```

```bash
git commit -m "Add patient registration page"
```

Keep commit messages short and descriptive.

---

# Push Your Changes to GitHub

Before pushing, make sure nobody else pushed changes while you were working:

```bash
git pull --rebase origin main
```

If there are no conflicts, push:

```bash
git push origin main
```

Your changes are now on GitHub.

---

# The Full Workflow

For everyday development, you can follow this:

```bash
# Get the latest code
git pull origin main

# Start the project
docker compose up --build

# Make your changes...

# Check your changes
git status
git diff

# Commit
git add .
git commit -m "Describe what you changed"

# Get any changes made by teammates
git pull --rebase origin main

# Push to GitHub
git push origin main
```

That's it.

---

# If There Is a Git Conflict

If Git tells you there is a conflict, **don't force anything**.

Run:

```bash
git status
```

Git will show you which files have conflicts.

If you are not sure how to resolve them, ask the team before continuing.

---

# Stopping Docker

To stop the project:

```bash
docker compose down
```

Your PostgreSQL data will normally remain stored in the Docker volume.

### Reset the database completely

```bash
docker compose down -v
```

**Warning:** this deletes the local PostgreSQL data.

Only use this if you intentionally want to start with a fresh database.

---

# Important Rules

* Never commit `.env`
* Never commit API keys or passwords
* Always pull the latest `main` before starting
* Test your changes before pushing
* Keep your commits descriptive
* Don't overwrite another teammate's work
* If you change dependencies, rebuild Docker
* Ask the team before making major architectural changes

---

# Project Status

This project is currently under active development and is **not production-ready**.
