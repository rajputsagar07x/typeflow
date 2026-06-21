# TypeFlow

Premium typing and keyboard productivity learning platform.

## Quick Start

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- PostgreSQL 14+ running locally ([postgresql.org](https://www.postgresql.org/download/windows/))

### 1 — Install dependencies
```bash
npm install
```

### 2 — Configure environment
```bash
# Copy the example config
cp .env.example server/.env

# Edit server/.env — set your PostgreSQL connection string and admin credentials
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/typeflow
# OWNER_EMAIL=admin@example.com
# OWNER_PASSWORD=yourpassword
# SESSION_SECRET=run_openssl_rand_hex_32_and_paste_here
```

### 3 — Create the database
```bash
# Create a database named "typeflow" in PostgreSQL first, then:
npm run db:push     # applies schema
npm run seed        # seeds all lessons, shortcuts, practice texts, achievements
```

### 4 — Start the app
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

The API runs on http://localhost:5000.

## Admin Panel
Visit http://localhost:3000/owner-admin and log in with the credentials from server/.env.

## Routes
| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/dashboard` | User dashboard |
| `/lessons` | Lesson catalog |
| `/lessons/:id` | Individual lesson |
| `/practice` | Typing practice |
| `/analytics` | Analytics view |
| `/shortcuts` | Keyboard shortcuts reference |
| `/owner-admin` | Admin login |

## Production Build
```bash
npm run build
# Server bundle → server/dist/index.mjs
# Client bundle → client/dist/
npm run start     # runs production server
```

## Project Structure
```
typeflow/
├── client/           # React + Vite frontend
│   └── src/
│       ├── pages/    # App + admin pages
│       ├── components/ # UI components
│       ├── hooks/    # use-toast, use-mobile
│       └── lib/      # API client, utils
├── server/           # Express + Drizzle backend
│   └── src/
│       ├── routes/   # API route handlers
│       ├── lib/      # Auth, logger, schemas
│       ├── schema.ts # Database schema
│       ├── db.ts     # Database connection
│       └── seed.ts   # Seed script
└── package.json      # Workspace root
```
