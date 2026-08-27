````markdown
# 🏠 Smart Home Healthcare Platform

> **Connecting people with trusted care, right at home.**

A smart home healthcare platform designed to connect **patients and families** with healthcare professionals who can provide care in the comfort of their homes.

The platform brings together **patients, nurses, physiotherapists, mental health professionals, and other care providers** through a centralized system that uses patient needs, provider information, location, availability, and AI-assisted categorization to help find suitable care.

> 🚀 Built as part of the **LebNexis Career Launch – Web Development Program**

---

## 💡 The Idea

Getting the right healthcare support at home can be difficult.

Our goal is to make that process simpler:

```text
👤 Patient
    │
    ▼
📝 Describes their needs
    │
    ▼
🤖 AI-assisted categorization
    │
    ▼
🔎 Find suitable providers
    │
    ▼
📍 Location + Availability
    │
    ▼
📅 Request a provider
````

The AI is designed to **assist with categorization and matching**.

> ⚠️ **Important:** The AI does not diagnose medical conditions or replace healthcare professionals.

---

## ✨ Planned Features

### 👤 For Patients

* Patient registration and profiles
* Submit home-care requests
* Describe healthcare needs
* Find suitable care providers
* Location-based provider matching
* View provider availability
* Request appointments

### 🩺 For Healthcare Providers

* Provider registration and profiles
* Manage availability
* Receive care requests
* Accept or reject appointment requests
* Manage upcoming appointments

### 🤖 Smart Features

* AI-assisted request categorization
* Provider matching
* Location-based matching
* Availability-based matching

### 💳 Payments

* Cash payments for the initial MVP

---

## 🛠️ Tech Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| 🎨 Frontend        | React / Next.js         |
| ⚙️ Backend         | Node.js / Express       |
| 🤖 AI / ML         | Python / FastAPI        |
| 🗄️ Database       | PostgreSQL              |
| 🐳 Development     | Docker / Docker Compose |
| 🔀 Version Control | Git / GitHub            |

> The technology stack may evolve as development continues.

---

# 🚀 Getting Started

Want to run the project locally?

It's designed so you **don't need to manually install every dependency**.

## 📋 Requirements

You only need:

* **Git**
* **Docker Desktop**

That's it.

You **do not need to install**:

* ❌ Node.js
* ❌ Python
* ❌ PostgreSQL

Docker handles the development environment for you.

---

## 1️⃣ Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/ChaficH/nursing-care-lebnexis.git
cd nursing-care-lebnexis
```

---

## 2️⃣ Create Your Environment File

Create your local `.env` file from the provided example.

### macOS / Linux / Git Bash

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

> 🔐 **Never commit your `.env` file to GitHub.**

---

## 3️⃣ Start the Project

Make sure **Docker Desktop is running**, then:

```bash
docker compose up --build -d
```

The `-d` flag runs the services in the background, so you can continue using your terminal.

The first build may take a few minutes while Docker downloads the required images and installs dependencies.

Once started, the platform runs:

```text
⚙️ Backend       → http://localhost:3000
🤖 ML Service    → http://localhost:8000
🗄️ PostgreSQL    → localhost:5432
```

---

## 4️⃣ Check Your Containers

Verify that everything is running:

```bash
docker compose ps
```

You should see:

```text
lebnexis_backend
lebnexis_ml_backend
lebnexis_postgres
```

PostgreSQL should show as **healthy**.

---

# 🔍 Checking That Everything Works

### ⚙️ Backend

Open:

```text
http://localhost:3000
```

### 🗄️ Database

Open:

```text
http://localhost:3000/health/db
```

### 🤖 ML Service

Open:

```text
http://localhost:8000/health
```

### 🔗 ML Service Through Backend

Open:

```text
http://localhost:3000/health/ml
```

If these services respond correctly, your local environment is working.

---

# 📋 Viewing Docker Logs

Because Docker runs in the background, you can view the logs whenever needed.

### All services

```bash
docker compose logs -f
```

### Backend only

```bash
docker compose logs -f backend
```

### ML service only

```bash
docker compose logs -f ml-backend
```

### PostgreSQL only

```bash
docker compose logs -f postgres
```

Press:

```text
Ctrl + C
```

to stop viewing the logs.

> This **does not stop the containers**.

---

# 📁 Project Structure

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

The **Node.js / Express backend**.

Most backend development will happen here.

### `ml-backend/`

The **Python / FastAPI service** responsible for AI/ML functionality.

Python dependencies are listed in:

```text
ml-backend/requirements.txt
```

### `docker-compose.yml`

Controls how the backend, ML service, and PostgreSQL database run together.

---

# 💻 Making Changes

Open the project in your preferred code editor.

For VS Code:

```bash
code .
```

Then edit the files you need.

### Backend

Work inside:

```text
backend/
```

### AI / ML

Work inside:

```text
ml-backend/
```

### Docker

Edit:

```text
docker-compose.yml
```

Only modify Docker configuration when necessary.

---

# 🐳 Do I Need to Rebuild Docker?

## Normal Code Changes

For normal `.js` or `.py` changes, you generally **do not need to rebuild**.

Save your changes. The development containers are configured to detect code changes.

If necessary, restart the services:

```bash
docker compose restart
```

## Dependency Changes

If you change:

```text
backend/package.json
```

or:

```text
ml-backend/requirements.txt
```

rebuild the containers:

```bash
docker compose up --build -d
```

---

# 🔀 Git Workflow

Everyone on the team has **Write access** to the repository.

The basic workflow is:

```text
Pull → Edit → Test → Commit → Pull → Push
```

---

## 1. Before Starting Work

Always get the latest version:

```bash
git pull origin main
```

---

## 2. Make Your Changes

Edit the files you need.

Test the application with Docker.

Check what changed:

```bash
git status
```

To see the actual changes:

```bash
git diff
```

---

## 3. Commit Your Changes

Add your changes:

```bash
git add .
```

Create a commit:

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

# 🚀 Push Your Changes to GitHub

Before pushing, get any changes that teammates may have made:

```bash
git pull --rebase origin main
```

If there are no conflicts, push:

```bash
git push origin main
```

Your changes are now on GitHub.

---

# ⚡ Everyday Workflow

For normal development:

```bash
# Get the latest code
git pull origin main

# Start Docker
docker compose up -d

# Make your changes...

# Check your changes
git status
git diff

# Commit
git add .
git commit -m "Describe what you changed"

# Get changes from teammates
git pull --rebase origin main

# Push
git push origin main
```

If you changed dependencies, use:

```bash
docker compose up --build -d
```

instead of:

```bash
docker compose up -d
```

---

# ⚠️ If There Is a Git Conflict

If Git reports a conflict, **don't force anything**.

Run:

```bash
git status
```

Git will show which files have conflicts.

If you are not sure how to resolve them, ask the team before continuing.

---

# 🛑 Stopping Docker

To stop the containers:

```bash
docker compose down
```

Your PostgreSQL data normally remains stored in the Docker volume.

To start everything again:

```bash
docker compose up -d
```

---

# 🗄️ Reset the Database

If you intentionally want to delete your local database and start fresh:

```bash
docker compose down -v
```

Then:

```bash
docker compose up --build -d
```

> ⚠️ **Warning:** `docker compose down -v` deletes the local PostgreSQL Docker volume and all local database data.

Only use this if you intentionally want a fresh database.

---

# 🔐 Important Rules

* Never commit `.env`
* Never commit API keys or passwords
* Always pull the latest `main` before starting
* Test your changes before pushing
* Keep commits descriptive
* Don't overwrite another teammate's work
* If you change dependencies, rebuild Docker
* Ask the team before making major architectural changes
* Do not force-push to `main`

---

# 📌 Project Status

This project is currently under active development and is **not production-ready**.

---
