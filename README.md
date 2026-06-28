# SEAPEDIA Frontend

Multi-role marketplace UI — **Buyer**, **Seller**, **Driver**, **Admin** — with a premium glass-morphism design.

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

## Design System

| Token | Value |
|-------|-------|
| Headline Font | **Plus Jakarta Sans** (800 weight, -2px tracking) |
| Body Font | Poppins / Inter |
| Page Background | `#F8FBFF` → `#EAF5FF` gradient with radial glow pseudo-element |
| Card Style | Glass-morphism (`bg-white/80 backdrop-blur-md border-white/20`) |
| Primary Color | Blue (`#2563EB`) |
| Surface Variant | `#F0F4F9` |
| Roundness | `rounded-xl` (12px) / `rounded-2xl` (16px) |
| TopBar | Transparent glass (`bg-[rgba(248,251,255,0.8)] backdrop-blur-[12px]`) |
| Hero Image | `seapediaherobanner.webp` (2717×1529px) at full natural height |

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
| `/` | Landing | Hero banner, deals, featured products, reviews |
| `/products` | Product List | Search, sort, category filter overlay, product grid |
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
| `/seller/dashboard` | Seller Dashboard (compact KPI cards) |
| `/seller/store` | Store Management (inline info + edit) |
| `/seller/products` | Product Management (multi-image upload, CRUD) |
| `/seller/orders` | Order List |
| `/seller/orders/:id` | Order Detail |
| `/seller/reports` | Sales Reports |

### Driver (`X-Active-Role: Driver`)
| Path | Page | Description |
|------|------|-------------|
| `/driver/dashboard` | Driver Dashboard | Earnings summary, active jobs, job board, history preview |
| `/driver` | Job Board | Available jobs with route indicators, earnings mini-card |
| `/driver/jobs/:id` | Job Detail | Pickup → destination route, delivery fee, status action |
| `/driver/history` | Delivery History | Earnings hero card, compact job list with divider rows |

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
- Browse products with search & sort by name/price/date
- Filter by category (bottom-sheet on mobile, floating card on desktop)
- View product details & reviews
- View store profiles
- Register / Login

### Buyer
- Manage wallet (top-up, transaction history)
- Manage addresses (CRUD)
- Cart (single-store enforced)
- Checkout with discount codes (voucher/promo)
- Order tracking
- Purchase reports (daily/monthly)

### Seller
- Store profile management with inline edit
- Product CRUD with **multi-image upload** (up to 5, Cloudinary)
- Order processing pipeline
- Sales reports with charts

### Driver
- Dashboard with earnings summary, active job status, and quick actions
- Browse available delivery jobs
- Accept and complete deliveries
- View delivery history with earnings breakdown
- **Mobile-first layout** optimized for on-the-go use

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
│   ├── client.js     # Base config, JWT interceptor, auto-role headers
│   ├── auth.js
│   ├── admin.js
│   ├── buyer.js
│   ├── seller.js
│   ├── driver.js
│   └── guest.js
├── components/
│   ├── forms/        # Reusable form fields & validators
│   ├── shared/       # TopBar, Footer, Sidebar, Notifications, Chat
│   └── ui/           # Button, Input, Modal, Card, Badge, Skeleton, Toast, ImageUpload, ConfirmDialog
├── features/         # Page-level components (grouped by role)
│   ├── admin/        # Admin pages
│   ├── auth/         # Login, Register, Role Selection
│   ├── buyer/        # Buyer pages
│   ├── driver/       # Driver pages (Dashboard, JobBoard, JobDetail, History)
│   ├── guest/        # Landing, ProductList, ProductDetail, Reviews, Store
│   └── seller/       # Seller pages (Dashboard, Store, Products, Orders, Reports)
├── hooks/            # Custom React hooks (useLocalStorage, useNotification)
├── layouts/          # Role-based layout wrappers
│   ├── PublicLayout.jsx     # Glass TopBar + footer flex layout
│   ├── DashboardLayout.jsx  # Sidebar + main area
│   ├── SellerLayout.jsx
│   ├── DriverLayout.jsx
│   └── AdminLayout.jsx
├── lib/              # Utilities, formatters (currency, date), constants, cn() helper
├── stores/           # Zustand stores
│   ├── authStore.js  # Auth state, token, active role
│   ├── cartStore.js  # Cart state (persisted to localStorage)
│   └── uiStore.js    # UI preferences, sidebar, notifications
├── types/            # Zod schemas & type definitions
├── App.jsx           # Root component & route definitions
└── main.jsx          # Entry point (BrowserRouter, QueryClient, Toaster)
```

## Key Components

| Component | Description |
|-----------|-------------|
| `ImageUpload` | Multi-image upload (up to 5) with preview, remove, drag-to-reorder; uploads to Cloudinary via `/api/upload` |
| `TopBar` | Transparent glass navigation with backdrop blur, responsive hamburger menu |
| `Footer` | Sticky footer via flex-col layout on `PublicLayout` |
| `Button` | Variants: primary, outline, ghost, danger; sizes: sm, md, lg |
| `Input` | Styled input with label, error state, and focus ring |
| `Skeleton` | Loading placeholder with shimmer animation |
| `ConfirmDialog` | Modal confirmation dialog for destructive actions |
| `Card` | Glass-morphism card container |

## Security

| Layer | Implementation |
|-------|---------------|
| Input Validation | Zod schemas on all forms (login, register, checkout, product) |
| XSS Prevention | React auto-escapes JSX; DOMPurify for user-generated HTML |
| Token Storage | JWT in Zustand memory store (cleared on logout) |
| Request Headers | `Authorization: Bearer <token>` via Axios interceptor |
| Route Guards | `ProtectedRoute` for all role-specific routes |
| Role-Based Access | Role-scoped JWT tokens with per-role expiry |
| Rate Limiting | Server-side: login 5 req/min, general 200 req/min |
| Session | Stateless JWT: Buyer 4h, Driver 2d, Seller 7d, Admin 7d |

| Concern | Solution | Details |
|---------|----------|---------|
| Server state | TanStack Query | Caching, refetching, optimistic updates |
| Auth & role | Zustand (`authStore`) | Token, user, active role |
| Cart | Zustand (`cartStore`) | Persisted to localStorage |
| UI state | Zustand (`uiStore`) | Sidebar, theme, notifications |

## Code Conventions

- JavaScript (no TypeScript; type-checking via Zod + JSDoc)
- File name: `PascalCase.jsx` for components, `camelCase.js` for utilities
- Imports: React → libraries → components → API → utils/styles
- Tailwind: utility-first with `cn()` merge helper
- API calls go through `src/api/*.js` modules
- Page components in `features/`, reusable in `components/`
