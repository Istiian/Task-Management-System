# Personal Task Tracker — Backend
This repository contains the backend for the Personal Task Tracker application. It's a Node.js + Express API using PostgreSQL (Sequelize) for persistence and Redis for short-lived data (OTP, refresh tokens). Features include user authentication (JWT + refresh tokens), task CRUD with archiving, password reset via OTP/email, and a scheduler for notifications.

## Quick Features
- User registration, login, and secure JWT authentication (cookies)
- Refresh token stored in Redis
- Password reset using time-limited OTP sent via email
- Task creation, update, archive/unarchive, list (archived/unarchived), and delete
- Rate limiting (15-minute window)
- Scheduler for notifications (see scheduler/notification.js)

## Requirements
- Node.js (>= 18 recommended)
- PostgreSQL
- Redis
- An SMTP account for sending OTP emails (or a testing SMTP server)

## Installation
1. Clone the repository:
	```bash
	git clone https://github.com/Istiian/Personal-Task-Tracker.git
	cd backed
	```
2. Install dependencies:
	pnpm install / npm install

## Configuration
Create a `.env` file in the `backend` folder with the variables below:
PORT = 3000
db_name = Financial Tracker
db_user = postgres
db_password = 123
db_host = localhost
db_port = 5432
ACCESS_TOKEN_SECRET = 
REFRESH_TOKEN_SECRET = 
EMAIL_HOST = Your SMTP
EMAIL_PORT = SMTP Port
EMAIL_USER = you@example.com
EMAIL_PASS = your-smtp-password

## Running the project:
 - `npm start`/ `pnpm start`
 - `npm dev` / `pnpm dev`

## Project Structure
- `index.js` — app entry, middleware, route mounting, DB sync, scheduler 
- `db.js` — Sequelize connection
- `redis.js` — Redis client
- `routes/` — route definitions (`/auth`, `/user`, `/task`)
- `controller/` — request handlers
- `models/` — Sequelize models (`User`, `Task`)
- `service/` — reusable services (auth helpers, email)
- `scheduler/` — cron jobs (notifications)
- `validator/` — Joi validation schemas
- `middleware/` — custom middleware (validation)

## API Documentation
- All API endpoints are documented and tested on Postman. The file can be found on the root of the project. `Personal Task Tracker.postman_collection.json`

### Using Postman Collection:
1. Open Postman
2. Import the collection:
	- Click the `import` button.
	- Select `File`, find and choose `Personal Task Tracker.postman_collection.json`



