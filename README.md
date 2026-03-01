# Makanak Connect

Egypt's Premier Real Estate Platform — find, book, and list verified properties across Egypt.

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** components
- **TanStack Query** for server state
- **Zustand** for client state
- **React Router v6** for routing
- **React Hook Form** + **Zod** for forms and validation

## Getting Started

### Prerequisites

- Node.js 18+ (or use [nvm](https://github.com/nvm-sh/nvm))

### Install & Run

```sh
# 1. Install dependencies
npm install

# 2. Start the development server (runs on port 8080)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

### Environment / Proxy

In development, API calls to `/api` and static uploads at `/uploads` are proxied to the backend at `https://localhost:7148`. Configure the target in `vite.config.ts` if your backend runs on a different port.

## Project Structure

```
src/
  components/    — Shared UI components (Navbar, guards, etc.)
  features/      — Domain-driven feature modules (auth, properties, bookings, …)
  pages/         — Top-level route pages
  hooks/         — Generic React hooks
  lib/           — Utilities (API client, storage, encoding, …)
```

## Scripts

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start dev server with HMR on :8080  |
| `npm run build` | Type-check and build for production |
| `npm run lint`  | Run ESLint across the codebase      |
| `npm test`      | Run unit tests with Vitest          |

## License

© 2025 Makanak. All rights reserved.
