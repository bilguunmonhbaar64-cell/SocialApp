# Backend API (Express + Mongoose)

## 1) Install

```bash
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and fill values:

- `MONGODB_URI`
- `JWT_SECRET`

## 3) Run

```bash
npm run dev
```

Server default URL: `http://localhost:4000`

## Starter routes

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/posts`
- `POST /api/posts` (Bearer token)
- `POST /api/posts/:postId/like` (Bearer token)
- `POST /api/posts/:postId/comments` (Bearer token)
- `DELETE /api/posts/:postId` (Bearer token)
