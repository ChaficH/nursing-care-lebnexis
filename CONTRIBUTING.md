# Contributing to nursing-care-lebnexis (Windows Setup Guide)

Welcome! This guide walks you through everything needed to get this project running on your **Windows PC**, and how to add your own work (HTML/CSS, Laravel, whatever else) to it.

No prior Docker experience needed — just follow the steps in order.

---

## Table of contents

1. [What you need before starting](#1-what-you-need-before-starting)
2. [Fork the repo](#2-fork-the-repo)
3. [Install Git](#3-install-git)
4. [Install Docker Desktop](#4-install-docker-desktop)
5. [Clone your fork](#5-clone-your-fork)
6. [Set up environment variables](#6-set-up-environment-variables)
7. [Run the project](#7-run-the-project)
8. [Understanding the project structure](#8-understanding-the-project-structure)
9. [Adding your own files (HTML/CSS, Laravel, etc.)](#9-adding-your-own-files-htmlcss-laravel-etc)
10. [Committing and pushing your work](#10-committing-and-pushing-your-work)
11. [Opening a pull request](#11-opening-a-pull-request)
12. [Troubleshooting (Windows-specific)](#12-troubleshooting-windows-specific)

---

## 1. What you need before starting

| Requirement | Why |
|---|---|
| Windows 10 (2004+) or Windows 11 | Needed for WSL2, which Docker Desktop relies on |
| A GitHub account | To fork and push code |
| **Docker Desktop** | Runs everything — Node backend, Python ML service, and **PostgreSQL** — you never install Postgres by itself |
| **Git** | To clone/commit/push |
| ~10 GB free disk space | For Docker images/containers |

**Important:** You do **not** need to install Node.js, Python, PHP, or PostgreSQL directly on your PC. Docker runs all of it inside containers. The only two things you install yourself are **Git** and **Docker Desktop**.

---

## 2. Fork the repo

1. Go to **https://github.com/ChaficH/nursing-care-lebnexis**
2. Click the **Fork** button, top-right of the page.
3. Choose your own GitHub account as the destination.
4. GitHub creates a copy at `https://github.com/<your-username>/nursing-care-lebnexis` — this is **your** copy. You'll push your changes here, not to the original.

---

## 3. Install Git

1. Download Git for Windows: **https://git-scm.com/download/win**
2. Run the installer. Default options are fine for everything — just keep clicking **Next** and then **Install**.
3. Once installed, open **Git Bash** (search for it in the Start menu) — this is the terminal you'll use for every command below.
4. Confirm it worked:
   ```bash
   git --version
   ```

---

## 4. Install Docker Desktop

1. Download Docker Desktop for Windows: **https://www.docker.com/products/docker-desktop/**
2. Run the installer. When it asks, make sure **"Use WSL 2 instead of Hyper-V"** is checked (it's the default on modern Windows).
3. Restart your PC if the installer asks you to.
4. Open **Docker Desktop** from the Start menu and let it finish starting up (whale icon appears in the system tray, bottom-right).
5. If Windows prompts you to install the **WSL2 Linux kernel update**, click the link it gives you, install it, then reopen Docker Desktop.
6. Confirm it worked — open **Git Bash** and run:
   ```bash
   docker --version
   docker compose version
   ```

You do **not** need to open Docker Desktop's UI again after this — it just needs to be running in the background (check the whale icon in your system tray) whenever you use `docker compose` commands.

---

## 5. Clone your fork

In Git Bash:

```bash
cd ~
git clone https://github.com/<your-username>/nursing-care-lebnexis.git
cd nursing-care-lebnexis
```

Replace `<your-username>` with your actual GitHub username.

Add the original repo as `upstream`, so you can pull in updates later:

```bash
git remote add upstream https://github.com/ChaficH/nursing-care-lebnexis.git
```

---

## 6. Set up environment variables

```bash
cp .env.example .env
```

This creates your local `.env` file with default database credentials. You don't need to edit anything to get started — the defaults work out of the box.

---

## 7. Run the project

From inside the `nursing-care-lebnexis` folder:

```bash
docker compose up --build
```

First run takes a minute or two (downloading and building images). You'll see logs from three services start up:

- `lebnexis_postgres` — the database
- `lebnexis_backend` — Node.js API
- `lebnexis_ml_backend` — Python ML service

Leave this terminal window open while you work — it's showing live logs. To stop everything, press `Ctrl + C`, or open a new Git Bash window and run:

```bash
docker compose down
```

### Check it's working

Open in your browser:
- http://localhost:3000 → Node backend
- http://localhost:8000/health → Python ML service

Or in Git Bash:
```bash
curl http://localhost:3000/health/db
curl http://localhost:3000/health/ml
```

### Everyday commands

```bash
docker compose up -d              # start in the background
docker compose down               # stop everything (keeps database data)
docker compose down -v            # stop and wipe database data (fresh start)
docker compose logs -f            # watch logs from all services
docker compose restart backend    # restart just one service
docker compose exec postgres psql -U lebnexis -d lebnexis_db   # open a database prompt
```

---

## 8. Understanding the project structure

```
nursing-care-lebnexis/
├── docker-compose.yml     ← defines every service (backend, ml-backend, postgres)
├── .env.example           ← copy to .env, holds config/credentials
├── backend/               ← Node.js API
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
└── ml-backend/            ← Python ML service (FastAPI)
    ├── Dockerfile
    ├── requirements.txt
    └── app.py
```

Each folder with a `Dockerfile` is its own **service** — its own isolated container. `docker-compose.yml` is the file that connects them all together and tells Docker how to build and run each one, plus how they talk to each other and to PostgreSQL.

**PostgreSQL is required** — the backend and ML service both connect to it for data storage, and it's already wired up in `docker-compose.yml`. You never install or run Postgres yourself; the `postgres` service in Docker Compose handles it entirely, including persisting data between restarts.

---

## 9. Adding your own files (HTML/CSS, Laravel, etc.)

This project isn't locked to just Node and Python — you can add a static frontend, a Laravel app, or anything else as its own **service**. Here's how each one plugs in.

### Adding a plain HTML/CSS frontend

1. Create a new folder for it:
   ```bash
   mkdir frontend
   ```
2. Put your `index.html`, `style.css`, etc. inside `frontend/`.
3. Create `frontend/Dockerfile`:
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   ```
4. Add this service to `docker-compose.yml` (open the file and add this block under `services:`, at the same indentation level as `backend:`):
   ```yaml
     frontend:
       build:
         context: ./frontend
       container_name: lebnexis_frontend
       restart: unless-stopped
       ports:
         - "8080:80"
       volumes:
         - ./frontend:/usr/share/nginx/html
   ```
5. Run `docker compose up --build` again. Your site is now live at **http://localhost:8080**.

### Adding a Laravel app

1. Create a new folder:
   ```bash
   mkdir laravel-app
   ```
2. If you already have Laravel project files, put them inside `laravel-app/`. If starting fresh, you can generate the project using a temporary Composer container (no need to install PHP/Composer on Windows):
   ```bash
   docker run --rm -v "$(pwd)/laravel-app:/app" -w /app composer create-project laravel/laravel .
   ```
3. Create `laravel-app/Dockerfile`:
   ```dockerfile
   FROM php:8.3-fpm

   RUN apt-get update && apt-get install -y \
       libpq-dev unzip git curl \
       && docker-php-ext-install pdo pdo_pgsql

   WORKDIR /var/www
   COPY . .

   RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
   RUN composer install --no-interaction

   EXPOSE 9000
   CMD ["php-fpm"]
   ```
4. Add the service to `docker-compose.yml`:
   ```yaml
     laravel-app:
       build:
         context: ./laravel-app
       container_name: lebnexis_laravel
       restart: unless-stopped
       environment:
         DB_CONNECTION: pgsql
         DB_HOST: postgres
         DB_PORT: 5432
         DB_DATABASE: ${POSTGRES_DB:-lebnexis_db}
         DB_USERNAME: ${POSTGRES_USER:-lebnexis}
         DB_PASSWORD: ${POSTGRES_PASSWORD:-lebnexis}
       ports:
         - "9000:9000"
       depends_on:
         postgres:
           condition: service_healthy
       volumes:
         - ./laravel-app:/var/www
   ```
5. Laravel's built-in PHP server needs a web server in front of it for the browser to reach it directly (php-fpm alone only speaks FastCGI). If you want to browse it directly, either add an `nginx` sidecar service pointed at `laravel-app`, or simplify by using `php artisan serve` in the Dockerfile's `CMD` instead of `php-fpm`, exposing port `8000`:
   ```dockerfile
   CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
   ```
   and mapping `"8001:8000"` in `docker-compose.yml`. This is the simpler option for local development.
6. Run `docker compose up --build`.

### General rule of thumb

Any new piece of the stack = a new folder + a `Dockerfile` inside it + a new block under `services:` in `docker-compose.yml`. Copy the pattern from an existing service (like `backend`) and adjust the image, ports, and environment variables.

---

## 10. Committing and pushing your work

Always work on a branch, never directly on `main`:

```bash
git checkout -b my-feature-name
```

After making changes:

```bash
git status                     # see what changed
git add .                      # stage everything
git commit -m "Describe what you changed here"
git push origin my-feature-name
```

The first time you push, Git may open a browser window asking you to log into GitHub — sign in and authorize, and it'll complete the push automatically.

If Git instead asks for a username and password in the terminal, your GitHub account password won't work — GitHub requires a **Personal Access Token** instead:
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Generate a new token with `repo` permissions.
3. Use your GitHub username, and paste the token in place of your password when prompted.

---

## 11. Opening a pull request

1. Go to your fork on GitHub: `https://github.com/<your-username>/nursing-care-lebnexis`
2. You'll see a banner: **"my-feature-name had recent pushes"** with a **Compare & pull request** button — click it.
3. Make sure the base repository is `ChaficH/nursing-care-lebnexis` and the base branch is `main`.
4. Add a title and short description of what you did, then click **Create pull request**.

---

## 12. Troubleshooting (Windows-specific)

- **"docker compose" command not found** → Make sure Docker Desktop is open and fully started (whale icon in system tray, not spinning/loading).
- **WSL2 errors on startup** → Open PowerShell as Administrator and run `wsl --update`, then restart Docker Desktop.
- **Port already in use** (`3000`, `8000`, `5432`, etc.) → Something else on your PC is using that port. Change the corresponding value (`BACKEND_PORT`, `ML_PORT`, `POSTGRES_PORT`) in your `.env` file.
- **Slow performance / long build times** → Make sure your project folder lives inside your Linux filesystem via WSL2 (default when cloning through Git Bash), not on a Windows-native path shared into WSL — this is usually automatic, but if things feel very slow, check Docker Desktop → Settings → Resources → WSL Integration.
- **Antivirus blocking Docker** → Some Windows antivirus tools interfere with Docker's networking. Whitelist Docker Desktop if you hit unexplained connection errors.
- **Changes to code not showing up** → If you edited `package.json`, `requirements.txt`, or `composer.json`, you need to rebuild: `docker compose up --build`. Regular code edits reload automatically.
- **Git asks for credentials every time** → Run `git config --global credential.helper manager` once, and Windows will remember your login after the first successful authentication.
