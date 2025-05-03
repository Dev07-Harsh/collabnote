# 📝 CollabNote

## Table of Contents

* [✨ Features](#features)
  * [🔐 User Authentication](#user-authentication)
  * [📝 Note Management](#note-management)
  * [🔄 Real-Time Collaboration](#real-time-collaboration)
  * [🌍 Geolocation Tagging](#geolocation-tagging)
  * [🔎 Search & Sort](#search--sort)
  * [📦 Containerized](#containerized)
  * [🛡️ Rate-Limiting & Validation](#rate-limiting--validation)
* [🛠️ Tech Stack](#tech-stack)
* [📂 Repository Structure](#repository-structure)
* [⚙️ Local Setup (No Docker)](#local-setup-no-docker)
* [🐋 Docker & Docker Compose](#docker--docker-compose)
* [🔑 Environment Variables](#environment-variables)
* [📝 API Reference](#api-reference)
* [🎨 Frontend Usage](#frontend-usage)
* [🔄 Real-Time Collaboration Flow](#real-time-collaboration-flow)
* [🔒 Security & Rate Limiting](#security--rate-limiting)
* [⚖️ License](#license)

---

## ✨ Features

### 🔐 User Authentication

* Register & Login with JWT  
* Protected routes enforced on both frontend and backend  

### 📝 Note Management

* CRUD operations: Create, Read, Update, Delete  
* Markdown-style content in a simple textarea  
* “Share this note” toggle for real-time collaboration  

### 🔄 Real-Time Collaboration

* Live edits broadcast via Socket.IO rooms  
* Online presence indicator of collaborators  

### 🌍 Geolocation Tagging

* On note creation, capture client IP and attach city, region, country  

### 🔎 Search & Sort

* Case-insensitive, partial-match filtering on title & content  
* Sort by newest, oldest, or “My Notes First”  

### 📦 Containerized

* Dockerfiles for both server and client  
* `docker-compose.yml` for multi-service orchestration  

### 🛡️ Rate-Limiting & Validation

* express-rate-limit: 100 requests per 15 min per IP (configurable)  
* Joi schema validation on all API endpoints  

---

## 🛠️ Tech Stack

| Layer         | Technology                                                  |
| ------------- | ----------------------------------------------------------- |
| **Frontend**  | React (Vite), React Router, Context API, Axios              |
| **Backend**   | Node.js, Express.js, Socket.IO, JWT, Joi                    |
| **Database**  | MongoDB Atlas (Mongoose ORM)                                |
| **Realtime**  | Socket.IO                                                   |
| **Styling**   | CSS Variables, Glassmorphic themes, Responsive Grid/Flexbox |
| **Container** | Docker, Docker Compose                                      |
| **Other**     | date-fns, express-rate-limit, ip-api.com geolocation API    |

---

## 📂 Repository Structure

```text
.
├── client/                   # React + Vite frontend
│   ├── public/               # favicon, index.html template
│   ├── src/
│   │   ├── components/       # NoteForm, NoteItem, NotesList, ProtectedRoute…
│   │   ├── context/          # AuthContext for JWT state
│   │   ├── pages/            # Login, Register, NotesPage, NoteEditorPage
│   │   ├── services/         # Axios wrappers: api.js, authService.js, noteService.js
│   │   ├── index.css         # Global CSS, theme variables
│   │   ├── main.jsx          # App entrypoint
│   │   └── .env.example      # sample .env file
│   ├── Dockerfile            # Multi-stage build (Node → Nginx)
│   └── package.json
│
├── server/                   # Node.js + Express backend
│   ├── config/
│   │   └── db.js             # Mongoose connection
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── models/
│   │   ├── User.js           # User schema + bcrypt
│   │   └── Note.js           # Note schema + text index
│   ├── routes/
│   │   ├── auth.js           # /api/auth/register & /login
│   │   └── notes.js          # /api/notes CRUD + search + sort
│   ├── server.js             # Express app + Socket.IO setup
│   ├── Dockerfile            # Server image build
│   ├── .env.example          # sample .env file
│   └── package.json
│
├── .gitignore                # top-level ignore file
├── docker-compose.yml        # compose up --build for API + Web
└── README.md                 # this file
````

---

## ⚙️ Local Setup (No Docker)

### Prerequisites

* Node.js v18+ & npm
* MongoDB (locally or Atlas)

### Steps

1. **Clone** the repo

   ```bash
   git clone https://github.com/Dev07-Harsh/collabnote.git
   cd CollabNote
   ```

2. **Backend**

   ```bash
   cd server
   cp .env.example .env
   # Edit .env → set MONGO_URI, JWT_SECRET, PORT
   npm ci
   npm run dev
   ```

3. **Frontend**

   ```bash
   cd ../client
   cp .env.example .env
   # update VITE_API_URL if needed
   npm ci
   npm run dev
   ```

4. **Open**

   * UI: [http://localhost:5173](http://localhost:5173)
   * API health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🐋 Docker & Docker Compose

### 1. Build & Run Individually

#### Server

```bash
cd server
docker build -t collabnote-server .
docker run -d --name api \
  --env-file .env \
  -p 5000:5000 \
  collabnote-server
```

#### Client

```bash
cd client
docker build \
  --build-arg VITE_API_URL="http://host.docker.internal:5000/api" \
  -t collabnote-client .
docker run -d --name web -p 3000:80 collabnote-client
```

### 2. Orchestrate with Docker Compose

```bash
docker-compose up --build
```

* **UI:** [http://localhost:3000](http://localhost:3000)
* **API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

Teardown:

```bash
docker-compose down
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)

```dotenv
MONGO_URI=your-atlas-uri
JWT_SECRET=a-strong-random-secret
PORT=5000
```

### Frontend (`client/.env`)

```dotenv
VITE_API_URL=http://localhost:5000/api
```

> In Docker Compose, `VITE_API_URL` is provided as a build-arg.

---

## 📝 API Reference

### Auth

| Method | Endpoint             | Body                            | Response    |
| ------ | -------------------- | ------------------------------- | ----------- |
| POST   | `/api/auth/register` | `{ username, email, password }` | `{ token }` |
| POST   | `/api/auth/login`    | `{ email, password }`           | `{ token }` |

### Notes (requires `Authorization: Bearer <token>`)

| Method | Endpoint         | Query/Body                     | Description                      |         |                                             |
| ------ | ---------------- | ------------------------------ | -------------------------------- | ------- | ------------------------------------------- |
| GET    | `/api/notes`     | \`?search=\&sort=\[newest      | oldest                           | mine]\` | List notes (own + shared, with filter/sort) |
| GET    | `/api/notes/:id` | —                              | Get one note (owner or shared)   |         |                                             |
| POST   | `/api/notes`     | `{ title, content, isShared }` | Create a note (attaches geoData) |         |                                             |
| PUT    | `/api/notes/:id` | `{ title, content, isShared }` | Update own note                  |         |                                             |
| DELETE | `/api/notes/:id` | —                              | Delete own note                  |         |                                             |

---

## 🎨 Frontend Usage

1. **Login/Register** via `/login` or `/register`.
2. **Add Note:** Fill Title, Content, toggle “Share this note…”, click **Add Note**.
3. **Edit Note:** Click **Edit**, modify fields, click **Update Note**.
4. **Delete Note:** Click **Delete**.
5. **Search & Sort:** Use the controls on NotesPage to filter or reorder.
6. **Collaborate:** Share the `/notes/:id` URL with teammates.

---

## 🔄 Real-Time Collaboration Flow

1. Owner toggles **Share this note…** and saves.
2. Owner opens the editor and copies the `/notes/:id` URL.
3. Collaborators open that URL (after login) → edits sync live.
4. Presence indicator shows all active collaborators.

---

## 🔒 Security & Rate Limiting

* **JWT** secures API & Socket.IO connections.
* **Joi** validates all incoming payloads.
* **express-rate-limit** caps at 100 requests per 15 min per IP.

---

## ⚖️ License

MIT © Dev07-Harsh

---