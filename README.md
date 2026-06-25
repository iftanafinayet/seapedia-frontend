# SEAPEDIA Frontend

React 19 + Vite + Tailwind CSS + Zustand + TanStack Query + React Router

## Setup

```bash
npm install
cp .env.example .env    # set VITE_API_BASE_URL=http://localhost:3000/api
npm run dev              # runs on localhost:5173
```

## Project Structure

```
src/
├── api/            # API client (axios instance + per-module request functions)
│   ├── client.js   # base axios config with JWT + X-Active-Role headers
│   ├── auth.js
│   ├── admin.js
│   ├── buyer.js
│   ├── seller.js
│   ├── driver.js
│   └── guest.js
├── components/
│   ├── forms/      # reusable form fields and validators
│   ├── shared/     # layout shells, headers, footers
│   └── ui/         # buttons, modals, cards, badges, etc.
├── features/       # page-level components grouped by role
│   ├── admin/
│   ├── auth/
│   ├── buyer/
│   ├── driver/
│   ├── guest/
│   └── seller/
├── hooks/          # custom React hooks
├── layouts/        # role-based layout wrappers
├── lib/            # utilities, constants, helpers
├── stores/         # Zustand stores
│   ├── authStore.js
│   ├── cartStore.js
│   └── uiStore.js
├── types/          # Zod schemas and type definitions
├── App.jsx         # root component + router
└── main.jsx        # entry point
```
