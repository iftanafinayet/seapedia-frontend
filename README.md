# SEAPEDIA Frontend

Multi-role marketplace UI — **Buyer**, **Seller**, **Driver**, **Admin**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 + class-variance-authority |
| State | Zustand 5 (client), TanStack Query 5 (server) |
| HTTP | Axios 1 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React + React Icons |
| Charts | Recharts |
| Routing | React Router 6 |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Dev server runs at `http://localhost:5173`  
Auto-connects to backend at `http://localhost:5000/api` (dev) or Railway URL (production).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | Auto (dev/prod) | Override backend API URL |

If `VITE_API_BASE_URL` is not set, the app auto-selects:
- Development → `http://localhost:5000/api`
- Production → `https://seapedia-backend-production.up.railway.app/api`

## Pages & Routes

### Public
| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Hero, deals, featured products, reviews |
| `/products` | Product List | Browse & filter products |
| `/products/:id` | Product Detail | Product info, reviews, add to cart |
| `/reviews` | Reviews | Customer reviews |
| `/stores/:id` | Store Detail | Store profile & products |
| `/login` | Login | Sign in |
| `/register` | Register | Create account |
| `/choose-role` | Role Selection | Pick active role |

### Buyer (`X-Active-Role: Buyer`)
| Path | Page |
|------|------|
| `/buyer/dashboard` | Buyer Dashboard |
| `/buyer/wallet` | Wallet (top-up, transactions) |
| `/buyer/addresses` | Address Management |
| `/buyer/cart` | Shopping Cart |
| `/buyer/checkout` | Checkout |
| `/buyer/orders` | Order List |
| `/buyer/orders/:id` | Order Detail |
| `/buyer/reports` | Purchase Reports |

### Seller (`X-Active-Role: Seller`)
| Path | Page |
|------|------|
| `/seller/dashboard` | Seller Dashboard |
| `/seller/store` | Store Management |
| `/seller/products` | Product Management |
| `/seller/orders` | Order List |
| `/seller/orders/:id` | Order Detail |
| `/seller/reports` | Sales Reports |

### Driver (`X-Active-Role: Driver`)
| Path | Page |
|------|------|
| `/driver/dashboard` | Driver Dashboard |
| `/driver` | Job Board |
| `/driver/jobs/:id` | Job Detail |
| `/driver/history` | Delivery History |

### Admin (`X-Active-Role: Admin`)
| Path | Page |
|------|------|
| `/admin/dashboard` | Admin Dashboard |
| `/admin/vouchers` | Voucher & Promo Management |
| `/admin/overdue` | Overdue Order Processing |
| `/admin/simulate` | Time Simulation (testing) |
| `/admin/deals` | Deal of the Day |
| `/admin/hero` | Hero Section Editor |

## Features by Role

### Guest
- Browse products with search & sort
- View product details & reviews
- View store profiles
- Register / Login

### Buyer
- Manage wallet (top-up, transaction history)
- Manage addresses (CRUD)
- Cart (single-store enforced)
- Checkout with discount codes
- Order tracking
- Purchase reports (daily/monthly)

### Seller
- Store profile management
- Product CRUD with image upload
- Order processing pipeline
- Sales reports

### Driver
- View available delivery jobs
- Take & complete deliveries
- Track earnings

### Admin
- Dashboard with metrics
- Voucher & promo CRUD
- Process overdue orders (auto-refund)
- Time simulation for testing
- Deal of the Day management
- Hero section content editor

## Project Structure

```
src/
├── api/              # Axios client + per-module API functions
│   ├── client.js     # Base config, JWT, X-Active-Role headers
│   ├── auth.js
│   ├── admin.js
│   ├── buyer.js
│   ├── seller.js
│   ├── driver.js
│   └── guest.js
├── components/
│   ├── forms/        # Reusable form fields & validators
│   ├── shared/       # Layout shells, headers, footers, notifications
│   └── ui/           # Button, Modal, Card, Badge, Skeleton, Toast, etc.
├── features/         # Page-level components (grouped by role)
│   ├── admin/        # Admin pages
│   ├── auth/         # Login, Register, Role Selection
│   ├── buyer/        # Buyer pages
│   ├── driver/       # Driver pages
│   ├── guest/        # Landing, products, reviews, store
│   └── seller/       # Seller pages
├── hooks/            # Custom React hooks
├── layouts/          # Role-based layout wrappers
│   ├── PublicLayout.jsx
│   ├── DashboardLayout.jsx
│   ├── SellerLayout.jsx
│   ├── DriverLayout.jsx
│   └── AdminLayout.jsx
├── lib/              # Utilities, formatters (currency, date), constants
├── stores/           # Zustand stores
│   ├── authStore.js  # Auth state, token, active role
│   ├── cartStore.js  # Cart state (persisted)
│   └── uiStore.js    # UI preferences
├── types/            # Zod schemas & type definitions
├── App.jsx           # Root component & route definitions
└── main.jsx          # Entry point (BrowserRouter, QueryClient)
```

## State Management

| Concern | Solution | Details |
|---------|----------|---------|
| Server state | TanStack Query | Caching, refetching, mutations |
| Auth & role | Zustand (`authStore`) | Token, user, active role |
| Cart | Zustand (`cartStore`) | Persisted to localStorage |
| UI state | Zustand (`uiStore`) | Sidebar, theme preferences |

## Code Conventions

- JavaScript (no TypeScript in source; type-checking via Zod + JSDoc)
- File name: `PascalCase.jsx` for components, `camelCase.js` for utilities
- Imports: React → libraries → components → API → utils/styles
- Tailwind classes: utility-first with `cn()` merge helper
- API calls go through `src/api/*.js` modules (never directly in components)
- Components are in `features/` (page-level) or `components/` (reusable)
