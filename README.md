# Tresa — Project Management Tool

A full-stack collaborative project management tool like Trello/Asana, built with React.js, Tailwind CSS, Node.js, Express.js, MongoDB, and Socket.IO.

## Features

- **Authentication** — Register/Login with JWT tokens
- **Project Boards** — Create group projects with custom colors
- **Kanban Board** — Drag & drop tasks across columns (To Do, In Progress, In Review, Done)
- **Task Management** — Create, edit, assign, prioritize, and set due dates
- **Comments** — Real-time commenting with typing indicators
- **Member Invites** — Invite team members by email with roles (admin/member/viewer)
- **Notifications** — Real-time push notifications via WebSockets
- **Real-time Updates** — All changes sync instantly across connected users via Socket.IO

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js, Tailwind CSS v3, React Router, Socket.IO Client, @hello-pangea/dnd |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |

## Project Structure

```
Tresa/
├── backend/
│   ├── src/
│   │   ├── controllers/     # authController, projectController, taskController, commentController, userController
│   │   ├── models/          # User, Project, Task, Comment
│   │   ├── routes/          # auth, projects, tasks, comments, users
│   │   ├── middleware/       # auth.js (JWT middleware)
│   │   ├── socket/          # socket.js (Socket.IO setup)
│   │   └── index.js         # Express + Socket.IO server
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Layout, Sidebar, Header
│   │   │   ├── projects/    # CreateProjectModal, InviteMemberModal, ProjectSettingsModal
│   │   │   └── tasks/       # TaskCard, TaskModal, CreateTaskModal
│   │   ├── context/         # AuthContext (auth + socket)
│   │   ├── pages/           # Login, Register, Dashboard, ProjectBoard
│   │   ├── utils/           # api.js (axios), socket.js
│   │   └── App.jsx
│   └── package.json
└── package.json
```

## Setup & Run

### 1. Install dependencies

```bash
# Root (concurrently)
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Environment Variables

Backend `.env` is pre-configured at `backend/.env`:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tresa_super_secret_jwt_key_2024
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Run the app

**Option A — Run both with one command (from root):**
```bash
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1 (backend)
cd backend && npm run dev

# Terminal 2 (frontend)
cd frontend && npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/projects | Get all user projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| POST | /api/projects/:id/invite | Invite member |
| GET | /api/tasks/project/:projectId | Get project tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| PUT | /api/tasks/:id/move | Move task (drag & drop) |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/comments/task/:taskId | Get task comments |
| POST | /api/comments/task/:taskId | Post comment |
| DELETE | /api/comments/:id | Delete comment |
| GET | /api/users/search?q= | Search users |
| GET | /api/users/notifications | Get notifications |
| PUT | /api/users/notifications/read | Mark all read |

## Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| join:project | Client→Server | Join project room |
| task:created/updated/deleted/moved | Server→Client | Real-time task sync |
| comment:created/updated/deleted | Server→Client | Real-time comment sync |
| typing:start/stop | Bidirectional | Comment typing indicators |
| notification | Server→Client | Push notifications |
