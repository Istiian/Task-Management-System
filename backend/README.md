# Personal Task Tracker — Backend

A RESTful API for managing projects, tasks, team members, and comments. Built with **Node.js**, **Express**, **PostgreSQL** (via Sequelize ORM), and **Redis** for caching and OTP storage.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing with Postman](#testing-with-postman)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [User](#user)
  - [Project](#project)
  - [Task](#task)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Caching Strategy](#caching-strategy)
- [Rate Limiting](#rate-limiting)
- [Scheduled Jobs](#scheduled-jobs)
- [Error Handling](#error-handling)
- [Logging](#logging)

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Node.js (ESM modules)               |
| Framework     | Express 5                           |
| Database      | PostgreSQL via Sequelize ORM        |
| Cache / Store | Redis (ioredis / node-redis)        |
| Auth          | JWT (access + refresh tokens), Passport.js |
| Validation    | Joi                                 |
| Email         | Nodemailer                          |
| Scheduler     | node-cron                           |
| Logging       | Winston                             |
| Package Mgr   | pnpm                                |

---

## Project Structure

```
backend/
├── index.js                    # App entry point — Express setup, DB sync, server start
├── redis.js                    # Redis client initialisation
├── src/
│   ├── config/
│   │   ├── db.js               # Sequelize connection
│   │   └── passport.js         # Passport JWT strategy
│   ├── lib/
│   │   ├── bcrypt.js           # Password hashing helpers
│   │   ├── jwt.js              # Token generation and verification
│   │   └── nodemailer.js       # Email sending helper
│   ├── middleware/
│   │   ├── canAccessProject.js # Project-level RBAC guard
│   │   ├── canAccessTask.js    # Task-level RBAC guard
│   │   ├── errorHandler.js     # Centralised error handler
│   │   └── validateForm.js     # Joi request body validation
│   ├── models/
│   │   ├── user.js
│   │   ├── project.js
│   │   ├── project_member.js
│   │   ├── task.js
│   │   ├── task_assignees.js
│   │   ├── comment.js
│   │   └── relations.js        # All Sequelize associations
│   ├── modules/
│   │   ├── auth/               # Login, logout, token refresh, password reset
│   │   ├── user/               # Registration, profile, password change
│   │   ├── project/            # Project CRUD, members, project-scoped tasks
│   │   ├── task/               # Task detail, assignees, task-scoped comments
│   ├── scheduler/
│   │   └── notification.js     # Deadline notification cron job
│   └── util/
│       ├── apiError.js         # Custom error class
│       ├── authCookie.js       # Refresh token cookie helpers
│       ├── cache.js            # Cache version bump helpers
│       ├── keySorting.js       # Stable cache key generation
│       └── logger.js           # Winston logger instance
└── logs/
    ├── combined.log
    └── error.log
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- Redis instance

### Installation

```bash
# Install dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env

# Start development server (with auto-reload)
pnpm dev

# Start production server
pnpm start
```

The server starts on the port defined in `PORT` (default behaviour reads from `.env`).

On startup the app:
1. Connects to PostgreSQL and runs `sequelize.sync({ alter: true })` to keep the schema in sync.
2. Connects to Redis.
3. Starts the deadline notification cron job.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development        # Set to "production" to enable secure cookies

# Database
DB_NAME=task_tracker
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost

# Redis
REDIS_URL=redis://localhost:6379

# JWT
TOKEN_SECRET=your_jwt_secret_here

# Email (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=yourpassword

# CORS
CLIENT_URL=http://localhost:5173
```

---

## Testing with Postman

A Postman collection covering all API routes is included in the backend root:

```
backend/Task Management System.postman_collection.json
```

To use it:
1. Open Postman and click **Import**.
2. Select `Task Management System.postman_collection.json`.
3. Set the `baseUrl` collection variable to your server URL (e.g., `http://localhost:3000`).
4. Run the **Login** request first — the collection uses the returned `accessToken` for authenticated requests.

---

## API Reference

All protected routes require an `Authorization: Bearer <accessToken>` header unless otherwise noted.

### Auth

Base path: `/auth`

| Method | Path                     | Auth | Description                              |
|--------|--------------------------|------|------------------------------------------|
| POST   | `/sessions`              | No   | Login — returns access token, sets refresh token cookie |
| DELETE | `/sessions`              | No   | Logout — clears refresh token cookie     |
| POST   | `/tokens`                | No   | Refresh access token using cookie        |
| POST   | `/password/reset-requests` | No | Send OTP to email for password reset     |
| PUT    | `/password`              | No   | Reset password using OTP                 |

**Login request body:**
```json
{ "username": "johndoe", "password": "Secret@123" }
```

**Login response:**
```json
{ "message": "Login successful", "accessToken": "<jwt>" }
```
The refresh token is stored in an `httpOnly` cookie scoped to `/auth`.

**Password reset flow:**
1. `POST /auth/password/reset-requests` with `{ "email": "..." }` — sends a 6-digit OTP (valid 5 minutes, stored in Redis).
2. `PUT /auth/password` with `{ "email", "otp", "newPassword", "repeatNewPassword" }`.

---

### User

Base path: `/user`

| Method | Path             | Auth | Description                          |
|--------|------------------|------|--------------------------------------|
| POST   | `/`              | No   | Register a new user                  |
| PATCH  | `/me`            | Yes  | Update first name, last name, email  |
| PATCH  | `/me/password`   | Yes  | Change password                      |
| GET    | `/me/projects`   | Yes  | List projects owned by the user      |
| GET    | `/me/tasks`      | Yes  | List tasks assigned to the user      |

**Register request body:**
```json
{
  "username": "johndoe",
  "password": "Secret@123",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Query parameters for `/me/projects`:**

| Param  | Type   | Description                  |
|--------|--------|------------------------------|
| page   | number | Page number (default: 1)     |
| limit  | number | Items per page (default: 10) |
| status | string | `active` or `archived`       |
| name   | string | Partial name search          |

**Query parameters for `/me/tasks`:**

| Param  | Type   | Description                         |
|--------|--------|-------------------------------------|
| page   | number | Page number (default: 1)            |
| limit  | number | Items per page (default: 10)        |
| status | string | `pending`, `in_progress`, `completed` |

---

### Project

Base path: `/project` — all routes require JWT authentication.

| Method | Path                              | Role Required         | Description                      |
|--------|-----------------------------------|-----------------------|----------------------------------|
| POST   | `/`                               | Authenticated         | Create a new project             |
| GET    | `/:projectId`                     | owner / admin / member | Get project details             |
| PATCH  | `/:projectId`                     | owner                 | Update project name/description/status |
| DELETE | `/:projectId`                     | owner                 | Delete project                   |
| GET    | `/:projectId/members`             | owner / admin / member | List project members            |
| POST   | `/:projectId/members/:memberId`   | owner                 | Add a member                     |
| DELETE | `/:projectId/members/:memberId`   | owner                 | Remove a member                  |
| PATCH  | `/:projectId/members/:memberId`   | owner                 | Update member role               |
| POST   | `/:projectId/tasks`               | owner / admin         | Create a task in the project     |
| GET    | `/:projectId/tasks`               | owner / admin / member | List tasks in the project       |
| PATCH  | `/:projectId/tasks/:taskId`       | owner / admin         | Update task title/description/deadline |
| DELETE | `/:projectId/tasks/:taskId`       | owner / admin         | Delete a task                    |

**Create project request body:**
```json
{ "name": "My Project", "description": "Optional description" }
```

**Project status values:** `active`, `archived`

**Member role values:** `admin`, `member`

**Create task request body:**
```json
{
  "taskData": {
    "title": "Fix login bug",
    "description": "Optional",
    "deadline": "2025-12-31T23:59:59Z"
  }
}
```

**Query parameters for `GET /:projectId/tasks`:**

| Param    | Type   | Description                         |
|----------|--------|-------------------------------------|
| page     | number | Page number (default: 1)            |
| limit    | number | Items per page (default: 10)        |
| status   | string | `pending`, `in_progress`, `completed` |
| deadline | date   | Exact deadline filter               |
| title    | string | Partial title search                |

---

### Task

Base path: `/task` — all routes require JWT authentication.

| Method | Path                              | Role Required         | Description                  |
|--------|-----------------------------------|-----------------------|------------------------------|
| GET    | `/:taskId`                        | owner / admin / member | Get task details            |
| GET    | `/:taskId/assignees`              | owner / admin / member | List task assignees         |
| POST   | `/:taskId/assignees/:memberId`    | owner / admin         | Assign user to task          |
| DELETE | `/:taskId/assignees/:memberId`    | owner / admin         | Unassign user from task      |
| POST   | `/:taskId/comments`               | owner / admin / member | Add a comment to a task     |
| GET    | `/:taskId/comments`               | owner / admin / member | Get comments for a task     |

**Task status values:** `pending`, `in_progress`, `completed`

> Task status updates are handled via `PATCH /project/:projectId/tasks/:taskId`.

**Query parameters for `GET /:taskId/comments`:**

| Param | Type   | Description              |
|-------|--------|--------------------------|
| page  | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

---

## Authentication

The API uses a dual-token strategy:

- **Access token** — short-lived JWT (15 minutes). Sent in the `Authorization: Bearer` header.
- **Refresh token** — long-lived JWT (7 days). Stored in an `httpOnly`, `SameSite=strict` cookie scoped to `/auth`. Not accessible via JavaScript.

The Passport JWT strategy extracts the token from the `Authorization` header and looks up the user by `payload.id`.

---

## Role-Based Access Control

Projects have three actor types:

| Role   | Description                                         |
|--------|-----------------------------------------------------|
| owner  | The user who created the project. Full control.     |
| admin  | A project member with elevated privileges.          |
| member | A standard project member. Read access on most endpoints. |

The `canAccessProject` and `canAccessTask` middleware enforce these roles on every protected route. `canAccessTask` resolves the parent project from the task to perform the check.

---

## Caching Strategy

Redis is used for read-through caching with a **version-based cache invalidation** strategy:

- Each project and user has a numeric version key in Redis (e.g., `project:1:version`).
- Cache keys embed the current version (e.g., `project:1:v3:tasks:...:page:1:limit:10`).
- On any write (create / update / delete), the version is incremented via `INCR`. Old cached results become unreachable without explicit deletion.
- Individual records (e.g., `project:1`, `task:5`) are also cached and deleted directly on mutation.
- Default TTL for list caches: **1 hour** (tasks under a project: **2 minutes**).
- Query filter objects are key-sorted before serialisation to ensure cache key stability regardless of parameter order.

---

## Rate Limiting

Two layers of rate limiting are applied:

| Layer         | Window     | Max Requests | Applies To              |
|---------------|------------|--------------|-------------------------|
| Global        | 15 minutes | 100          | All routes              |
| Auth-specific | 5 minutes  | 5            | `POST /auth/sessions`   |

---

## Scheduled Jobs

A `node-cron` job runs **every 12 hours** (`0 */12 * * *`) to:

1. Find all tasks with a deadline within the next 24 hours that have not yet had a notification sent.
2. Send an email to each assigned user.
3. Mark the task's `notificationSent` flag as `true` to prevent duplicate notifications.

Timezone: `Asia/Shanghai` (UTC+8).

---

## Error Handling

All errors flow through the centralised `errorHandler` middleware:

- `ApiError` instances return their `status` code and `message`.
- Unhandled errors default to `500 Internal Server Error`.
- 4xx errors are logged at `warn` level; 5xx errors are logged at `error` level with stack traces.
- Unknown routes return `404` with the attempted path.

---

## Logging

Winston is configured with three transports:

| Transport       | Level | Output              |
|-----------------|-------|---------------------|
| Console         | info  | Colorised, simple   |
| combined.log    | info  | JSON with timestamp |
| error.log       | error | JSON with timestamp |

Log files are written to `backend/logs/`.
