# Nucleus Auth System

A production-ready full-stack authentication system built as a professional portfolio piece. Features a clean Node.js/TypeScript REST API paired with a polished React UI that mirrors a modern SaaS design system.

## Architecture

```
auth-api-node/
├── backend/                    # Express + TypeScript REST API
│   └── src/
│       ├── config/env.ts       # Environment variables
│       ├── controllers/        # Request/response handlers
│       │   └── auth.controller.ts
│       ├── middlewares/        # JWT authentication gate
│       │   └── auth.middleware.ts
│       ├── routes/             # Route definitions
│       │   ├── auth.routes.ts
│       │   └── user.routes.ts
│       ├── services/           # Business logic + in-memory store
│       │   └── auth.service.ts
│       └── server.ts           # Express app entry point
│
└── frontend/                   # React + Vite + Tailwind UI
    └── src/
        ├── components/         # Reusable UI primitives
        │   ├── InputField.tsx  # Floating-label input
        │   ├── PrimaryButton.tsx
        │   ├── GoogleButton.tsx
        │   └── LeftPanel.tsx   # Dark branding panel
        ├── pages/              # Route-level views
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── ForgotPasswordPage.tsx
        │   └── DashboardPage.tsx
        ├── services/api.ts     # Typed fetch client
        ├── App.tsx             # Router
        └── main.tsx            # Entry point
```

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Backend runtime  | Node.js 20 + TypeScript             |
| API framework    | Express 4                           |
| Authentication   | JSON Web Tokens (1 h expiry)        |
| Password hashing | argon2id                            |
| Frontend         | React 18 + Vite 5                   |
| Styling          | Tailwind CSS 3                      |
| Routing          | React Router DOM v6                 |
| Font             | DM Sans (Google Fonts)              |

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
# API available at http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# UI available at http://localhost:5173
```

> Both servers must run simultaneously for the full flow to work.

## API Endpoints

| Method | Path             | Auth Required | Request Body                        | Response                      |
| ------ | ---------------- | ------------- | ----------------------------------- | ----------------------------- |
| POST   | /auth/register   | No            | `{ name, email, password }`         | `201 { id, name, email }`     |
| POST   | /auth/login      | No            | `{ email, password }`               | `200 { token }`               |
| GET    | /user/me         | Bearer token  | —                                   | `200 { id, name, email }`     |

### Error format

All errors return `{ "error": "message" }` with the appropriate HTTP status code.

## Pages

| Route             | Description                                         |
| ----------------- | --------------------------------------------------- |
| `/login`          | Email + password login with "Remember me" toggle    |
| `/register`       | Account creation with client-side validation        |
| `/forgot-password`| Email submission with simulated success state       |
| `/dashboard`      | Protected route — shows user info + logout          |

## Screenshots

<img width="1359" height="845" alt="image" src="https://github.com/user-attachments/assets/37f8b565-0ef7-429b-ad25-717ee691d0cb" />


## License

MIT
