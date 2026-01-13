# Goodreads Clone

A scalable Goodreads-like web application for book discovery, rating, reviewing, tracking reading status, social connections, book clubs, and personalized recommendations.
Deployed on Render. Link: https://goodreads-frontend-rp56.onrender.com/login
## Features
- User registration and login (JWT authentication)
- Book catalog with search and pagination
- Add books to personal bookshelf with status: Want to Read, Currently Reading, Read
- View and manage your bookshelf
- Update reading status or remove books from shelf
- **Community features:**
  - Create and join book clubs/groups
  - Start discussions and reply to topics
  - Search and browse groups by name, description, or tags
  - View group members and discussions
- Social features (book clubs, friends) 

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend:** React, Next.js (App Router), TypeScript
---

## Backend Setup

1. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env`.
3. **Start the server:**
   ```sh
   npm run dev
   ```
   The backend runs on [http://localhost:5000](http://localhost:5000)
   
## Frontend Setup

1. **Install dependencies:**
   ```sh
   cd frontend
   npm install
   ```
2. **Start the frontend:**
   ```sh
   npm run dev
   ```
   The frontend runs on [http://localhost:3000](http://localhost:3000)

---

## Usage
- Register or log in
- Browse the book catalog
- Add books to your shelf and update their status
- View and manage your bookshelf
- Create or browse topics in community and add posts
- View others' profiles and follow others

---

## Development
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`


