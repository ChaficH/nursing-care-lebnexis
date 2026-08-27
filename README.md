# Smart Home Healthcare Platform

A web platform that connects patients and families with home healthcare providers such as nurses, physiotherapists, and mental health professionals.

The platform uses patient requests, provider information, location, availability, and AI-assisted categorization to help connect patients with suitable home healthcare providers.

> Built as part of the **LebNexis Career Launch – Web Development Program**.

## How It Works

The basic idea is:

**Patient describes their needs → AI helps categorize the request → suitable providers are found → patient requests a provider.**

The AI is intended to assist with categorization and matching. It **does not diagnose medical conditions**.

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

## Tech Stack

* **Frontend:** React / Next.js
* **Backend:** Node.js / Express
* **AI / ML:** Python / FastAPI
* **Database:** PostgreSQL
* **Development:** Docker / Docker Compose
* **Version Control:** Git / GitHub

The stack may change as development continues.

## Project Structure

```text
nursing-care-lebnexis/
│
├── backend/                # Node.js / Express backend
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
│
├── ml-backend/             # Python / FastAPI service
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
│
├── docker-compose.yml      # Runs the complete development environment
├── .env.example            # Example environment variables
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Running the Project

You only need:

* Git
* Docker Desktop

You **do not** need to install Node.js, Python, or PostgreSQL separately.

### 1. Clone the repository

```bash
git clone https://github.com/ChaficH/nursing-care-lebnexis.git
cd nursing-care-lebnexis
```

### 2. Create the environment file

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

### 3. Start Docker

Make sure Docker Desktop is running, then:

```bash
docker compose up --build
```

The first build may take a few minutes.

### 4. Services

Once Docker is running:

| Service    | Address               |
| ---------- | --------------------- |
| Backend    | http://localhost:3000 |
| ML Service | http://localhost:8000 |
| PostgreSQL | localhost:5432        |

### 5. Test the services

Backend:

```text
http://localhost:3000
```

Database connection:

```text
http://localhost:3000/health/db
```

ML service connection:

```text
http://localhost:3000/health/ml
```

ML service directly:

```text
http://localhost:8000/health
```

## Stopping Docker

To stop the containers:

```bash
docker compose down
```

To completely reset the local database:

```bash
docker compose down -v
```

> `docker compose down -v` deletes the local PostgreSQL volume. Only use it when you intentionally want a fresh database.

## Development

Most of your work will happen inside one of these folders:

```text
backend/
ml-backend/
```

For example:

```text
backend/index.js
```

contains the current backend entry point.

The Python service is inside:

```text
ml-backend/
```

If a frontend is added later, it will have its own directory.

### After changing normal code

Usually you can simply save the file and continue developing.

### After changing dependencies

If you modify:

```text
backend/package.json
```

or:

```text
ml-backend/requirements.txt
```

rebuild the containers:

```bash
docker compose up --build
```

## Contributing

Before making changes, read:

**[CONTRIBUTING.md](CONTRIBUTING.md)**

It explains:

1. How to get the project running
2. Where to edit files
3. How to test your changes
4. How to commit your changes
5. How to push directly to `main`

## Important

* Never commit `.env`
* Never commit API keys, passwords, or other secrets
* Keep your changes related to the feature you are working on
* Test your changes before pushing
* If you are unsure where something belongs, ask the team before restructuring the project

## Project Status

This project is currently under active development and is **not production-ready**.
