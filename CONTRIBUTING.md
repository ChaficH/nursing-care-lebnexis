# Contributing / running this on your own machine

This guide is for friends/collaborators who want to fork the repo and run it locally. It works the same on Mac, Windows, and Linux — Docker handles the differences for you.

## 1. Fork the repo

1. Go to https://github.com/ChaficH/nursing-care-lebnexis
2. Click **Fork** (top right) to create your own copy under your GitHub account.
3. Clone *your fork* (not the original):

   ```bash
   git clone https://github.com/<your-username>/nursing-care-lebnexis.git
   cd nursing-care-lebnexis
   ```

4. (Optional but recommended) Add the original repo as `upstream` so you can pull in future changes:

   ```bash
   git remote add upstream https://github.com/ChaficH/nursing-care-lebnexis.git
   ```

## 2. Install Docker

You only need Docker — not Node.js, not Python, not Postgres.

- **Mac**: `brew install --cask docker`, or download from https://www.docker.com/products/docker-desktop/
- **Windows**: Download Docker Desktop from https://www.docker.com/products/docker-desktop/ (requires WSL2 — the installer will prompt you to enable it)
- **Linux**: Follow https://docs.docker.com/engine/install/ for your distro

After installing, open Docker Desktop once (or on Linux, make sure the `docker` service is running) and confirm:

```bash
docker --version
docker compose version
```

## 3. Set up environment variables

```bash
cp .env.example .env
```

The defaults work out of the box for local use — no editing required unless you want different ports/credentials.

## 4. Build and run

```bash
docker compose up --build
```

First run will take a minute or two while images build. After that, subsequent starts are fast:

```bash
docker compose up
```

## 5. Confirm it's working

Open in your browser:

- http://localhost:3000 — Node backend
- http://localhost:8000/health — Python ML service

Or from a terminal:

```bash
curl http://localhost:3000/health/db
curl http://localhost:3000/health/ml
```

## 6. Making changes and submitting a PR

1. Create a branch: `git checkout -b my-feature`
2. Edit code in `backend/` or `ml-backend/` — changes reload automatically in the running containers.
3. Commit and push to **your fork**: `git push origin my-feature`
4. Open a pull request from your fork's branch into `ChaficH/nursing-care-lebnexis` on GitHub.

## 7. Stopping / resetting

```bash
docker compose down       # stop containers, keep DB data
docker compose down -v    # stop containers and wipe DB data (clean slate)
```

## Troubleshooting

- **Port already in use**: something else on your machine is using 3000, 8000, or 5432. Change `BACKEND_PORT`, `ML_PORT`, or `POSTGRES_PORT` in `.env`.
- **Docker daemon not running**: make sure the Docker Desktop app is open (whale icon in menu bar/system tray) before running `docker compose` commands.
- **Changes not showing up**: if you edited `package.json` or `requirements.txt`, rebuild with `docker compose up --build`.
- **Windows users**: run these commands from PowerShell or WSL2, not the old `cmd.exe`.
