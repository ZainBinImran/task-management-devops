@'
# Task Management Application

A three-tier task management application built as a hands-on DevOps learning project.

## Architecture

- Frontend: React + Vite
- Backend: Python + Flask REST API
- Database: PostgreSQL
- Containerization: Docker
- Networking: Docker bridge network
- Persistence: Docker named volume

### Request Flow

Browser -> React Frontend -> Flask REST API -> PostgreSQL

The frontend is exposed on port 5173 and the backend API on port 5000.

The backend communicates with PostgreSQL through the Docker network using the database container name.

## Features

- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Search tasks
- Filter by status
- Task priorities
- Task status tracking
- Database persistence
- API health check
- Basic validation and error handling

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API/database health check |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/<id>` | Get a specific task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/<id>` | Update a task |
| DELETE | `/api/tasks/<id>` | Delete a task |

## Project Structure

```text
task-management/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── database/
│   └── init.sql
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md