# nursing-care-lebnexis

A nursing care platform with:
- **`backend/`** — Node.js API
- **`ml-backend/`** — Python ML service (FastAPI)
- **PostgreSQL** — shared database

All three run together via Docker Compose, so nobody needs to install Node, Python, or Postgres directly on their machine — just Docker.

---

## Deploy locally on macOS (Terminal)

### 1. Install Docker Desktop

If you don't have it yet:

```bash
brew install --cask docker
```

Then open the Docker app once from Spotlight/Applications so its engine starts (you'll see a whale icon in the menu bar). Alternatively, download it from https://www.docker.com/products/docker-desktop/.

Check it's running:

```bash
docker --version
docker compose version
```

### 2. Clone the repo

```bash
git clone https://github.com/ChaficH/nursing-care-lebnexis.git
cd nursing-care-lebnexis
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and adjust the Postgres credentials/ports if you want. The defaults work fine for local dev.

### 4. Build and start everything

```bash
docker compose up --build
```

This builds the `backend` and `ml-backend` images and starts three containers: `lebnexis_postgres`, `lebnexis_backend`, and `lebnexis_ml_backend`.

To run in the background instead:

```bash
docker compose up --build -d
```

### 5. Verify it's working

- Backend: http://localhost:3000 → `{"status":"ok", ...}`
- Backend → DB check: http://localhost:3000/health/db
- Backend → ML service check: http://localhost:3000/health/ml
- ML service: http://localhost:8000/health

### 6. Everyday commands

```bash
docker compose up -d          # start in background
docker compose down           # stop and remove containers (keeps DB data)
docker compose down -v        # stop and wipe DB data too
docker compose logs -f        # tail logs from all services
docker compose logs -f backend
docker compose restart backend
docker compose exec backend sh          # shell into the Node container
docker compose exec ml-backend bash     # shell into the Python container
docker compose exec postgres psql -U lebnexis -d lebnexis_db   # psql prompt
```

### 7. Making code changes

`backend/` and `ml-backend/` are mounted as live volumes, so editing files on your Mac is reflected in the containers immediately (Node/FastAPI both auto-reload). You generally won't need to rebuild unless you change `package.json` or `requirements.txt` — in that case:

```bash
docker compose up --build
```

---

## Project structure

```
nursing-care-lebnexis/
├── docker-compose.yml
├── .env.example
├── backend/            # Node.js API
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
└── ml-backend/         # Python ML service
    ├── Dockerfile
    ├── requirements.txt
    └── app.py
```

The `index.js` and `app.py` files here are minimal placeholders wired up to Postgres and to each other — swap in the real application code as it's built.

---

## Working with the database

Postgres data persists in a Docker volume (`pgdata`) between restarts. To connect from a GUI tool (TablePlus, DBeaver, Postico, etc.), use:

- Host: `localhost`
- Port: `5432` (or `POSTGRES_PORT` from your `.env`)
- User/Password/DB: whatever you set in `.env`

---

## Sharing this with collaborators

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for a friend-facing guide on forking the repo and running it with Docker on their own machine (Mac, Windows, or Linux).
