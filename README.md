# DevMeet API

A TypeScript + Express REST service that pairs developers for 1‑to‑1
mentoring sessions. Built to practise Prisma with PostgreSQL, JWT auth,
and conflict‑free booking logic.

## Table of contents
- [Stack](#stack)
- [Features](#features)
- [Installation](#installation)
- [API Endpoints Overview](#api-endpoints)

## Stack
- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- JWT / bcrypt
- Joi validator
## Features
- Register / Login
- Create & search mentorship slots
- Request & accept sessions
- Time‑zone aware matching

## Installation
### Prerequisites
Before installing, ensure you have the following:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Git](https://git-scm.com/) (for cloning the repository)

### Quick Installation
```bash
# Clone the repository
git clone https://github.com/hkhalaf1675/DevMeet-API.git

# Navigate to project directory
cd DevMeet-API

# Install dependencies
npm ci

# Set up environment variables
cp .env.example .env

# Create the database
npm run migrate

# Build the project
npm run build

# Start the application
npm start
```

## API Endpoints Overview

### 🔐 Authentication & Users

| Endpoint              | Method | Description                          | Auth Required |
|-----------------------|--------|--------------------------------------|---------------|
| `/api/auth/register` | POST   | Register new user                    | No            |
| `/api/auth/login`    | POST   | Login existing user                  | No            |
| `/api/users/my-profile`       | GET    | Get current user profile             | Yes           |
| `/api/users`          | GET    | Get all users (admin only)           | Yes  |
| `/api/users/update`      | PUT  | Update user profile                  | Yes           |

### 📅 Slots Management

| Endpoint            | Method | Description                          | Auth Required |
|---------------------|--------|--------------------------------------|---------------|
| `/api/slots`        | POST   | Create new time slot                 | Yes           |
| `/api/slots/:id`    | PUT    | Update slot details                  | Yes           |
| `/api/slots/:id`    | DELETE | Cancel a slot                        | Yes           |
| `/api/slots/:id`    | GET    | Get single slot details              | Yes           |
| `/api/slots`        | GET    | Get multiple slots (with filters)    | Yes           |
|`/api/slots/me`      | GET    | Get multiple slots for current mentor| Yes           |

### 🔄 Requests Management

| Endpoint                              | Method | Description                          | Auth Required |
|---------------------------------------|--------|--------------------------------------|---------------|
| `/api/requests/add-request`           | POST   | Create new request                   | Yes           |
| `/api/requests/:id/change-status`     | PUT    | Change request status                | Yes           |
| `/api/requests/my-requests`           | GET    | Get my requests (developer)          | Yes           |
| `/api/requests/upcoming-slot-requests`| GET    | Get upcoming requests (mentor)       | Yes           |
| `/api/requests/:id`                   | GET    | Get single request details           | Yes           |

### 📌 Notes
- **Base URL**: `https://api.yourservice.com/api`
- **Auth Required**: Endpoints marked "Yes" require `Authorization` header with Bearer token
- **Pagination**: Available on "get many" endpoints via `?page=1&perPage=10`
- **Filtering**: Supported on slots with parameters like `?topic=topic`