Here is the complete **Frontend PRD (Product Requirements Document)** for SEAPEDIA. 

It is structured to translate the backend logic and the original challenge levels into **specific pages, UI flows, state management, and component requirements** for a mobile-first, minimalist React frontend.

---

```markdown
# Frontend PRD – SEAPEDIA

**Version:** 1.0  
**Tech Stack:** React 18 + Vite + Tailwind CSS + Shadcn/ui + Zustand + TanStack Query + React Router DOM  
**Core Design Principle:** Mobile-First, White Primary, Minimalist, Elegant

---

## 1. Introduction

### 1.1 Purpose
This document defines the frontend requirements for SEAPEDIA. It serves as the single source of truth for UI/UX designers and frontend developers to build a responsive, role-aware marketplace application that seamlessly integrates with the Node.js + Express + Prisma backend.

### 1.2 Scope
- Build a Single Page Application (SPA) using React.
- Implement all user-facing flows from Level 1 to Level 7 of the technical challenge.
- Ensure full responsiveness across Mobile (primary), Tablet, and Desktop.
- Enforce Role-Based Access Control (RBAC) at the routing and UI level.
- Implement secure frontend practices (XSS prevention, form validation).

---

## 2. Design & UX Guidelines (Mobile-First)

### 2.1 Layout Strategy
- **Mobile (< 640px):** Single column layout. `16px` horizontal gutters. Fixed **Bottom Navigation** (72px height) for logged-in dashboards. Fixed **Top App Bar** (60px).
- **Tablet (640px - 1024px):** 2-column grids. Bottom Navigation remains.
- **Desktop (> 1024px):** **Left Sidebar** replaces the Bottom Navigation. Content max-width: `1280px`.

### 2.2 Visual Style (White Primary)
- **Background:** `#FFFFFF` for main surfaces, `#F8FAFC` for subtle section separators.
- **Text:** `#0F172A` (Primary), `#475569` (Secondary).
- **Primary Action:** `#4F46E5` (Indigo). Hover: `#4338CA`.
- **Cards:** White background, `12px` border-radius, ultra-soft shadow (`0 1px 3px rgba(0,0,0,0.04)`).
- **Typography:** Inter font. Base size `14px`. Headings: `24px`, `600` weight.
- **Touch Targets:** Minimum `44px` height/width for all interactive elements.

### 2.3 Micro-interactions
- **Loading:** Skeleton screens (shimmer effect) for product lists and order histories.
- **Feedback:** Toast notifications sliding from bottom (mobile) or top-right (desktop). Duration: 3 seconds.
- **Pull-to-Refresh:** Implemented on Buyer "Orders" and Driver "Available Jobs" lists.

---

## 3. Technology Stack (Frontend)

| Category | Library / Tool | Purpose |
| :--- | :--- | :--- |
| **Build Tool** | Vite | Fast development & hot module replacement (HMR). |
| **Core UI** | React 18, React Router DOM v6 | Component architecture & routing (Nested routes). |
| **Styling** | Tailwind CSS + Shadcn/ui | Utility-first CSS & fully customizable, minimalist UI components. |
| **State Management** | Zustand | Manage Auth, Active Role, Cart, and UI states. |
| **Server State / API** | TanStack Query (React Query) | Fetching, caching, and synchronizing server data (orders, products). |
| **Forms & Validation** | React Hook Form + Zod | Performant forms with schema validation matching backend Joi. |
| **HTTP Client** | Axios | Interceptors for attaching JWT tokens and handling 401 responses. |
| **Security** | DOMPurify | Sanitizing user-generated content (reviews) to prevent XSS. |

---

## 4. Architecture & Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/                  # Axios setup & API endpoint definitions
│   │   ├── client.js
│   │   ├── auth.js
│   │   ├── buyer.js
│   │   ├── seller.js
│   │   ├── driver.js
│   │   └── admin.js
│   ├── components/
│   │   ├── ui/               # Shadcn/ui components (Button, Card, Input, Dialog)
│   │   ├── shared/           # TopBar, BottomNav, Sidebar, LoadingSpinner
│   │   └── forms/            # Reusable form fields, AddressForm, ProductForm
│   ├── features/             # Feature-based modules (Scalable)
│   │   ├── auth/             # Login, Register, RoleSelect, ProtectedRoute
│   │   ├── guest/            # Landing, ProductList, ProductDetail, Reviews
│   │   ├── buyer/            # Wallet, Cart, Checkout, OrderHistory
│   │   ├── seller/           # StoreManage, ProductManage, IncomingOrders
│   │   ├── driver/           # JobBoard, JobDetail, DeliveryTracking
│   │   └── admin/            # Dashboard, VoucherManage, OverdueList
│   ├── hooks/                # Custom Hooks (useAuth, useCart, useWallet)
│   ├── layouts/              # PublicLayout, DashboardLayout
│   ├── lib/                  # Utils (cn function, date formatter, currency)
│   ├── stores/               # Zustand stores
│   │   ├── authStore.js      # user, roles, activeRole, token
│   │   ├── cartStore.js      # items, total, storeId
│   │   └── uiStore.js        # theme, sidebarOpen, notifications
│   ├── types/                # JSDoc types or TypeScript interfaces
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Tailwind directives + Font imports
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 5. Routing Structure

### 5.1 Public Routes (No Auth Required)
| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | `LandingPage` | SEAPEDIA Hero, featured products, application reviews. |
| `/products` | `ProductList` | Catalog with search, filters (by store/category optional). |
| `/products/:id` | `ProductDetail` | Product info, store info, "Add to Cart" button (if Buyer). |
| `/reviews` | `ReviewSection` | Full list of application reviews with rating stars. |
| `/login` | `LoginPage` | Form for username/email + password. |
| `/register` | `RegisterPage` | Form with role selection checkboxes (Buyer/Seller/Driver). |
| `/choose-role` | `RoleSelection` | Page/Modal showing owned roles; user selects active role. |

### 5.2 Protected Routes (Requires Auth + Specific Active Role)

**Buyer** (`/buyer` base path)
- `/buyer/dashboard` – Overview, balance card, recent orders.
- `/buyer/wallet` – Balance, top-up form, transaction history.
- `/buyer/addresses` – CRUD for delivery addresses.
- `/buyer/cart` – List of items, store name, proceed to checkout.
- `/buyer/checkout` – Address select, delivery method, voucher input, summary.
- `/buyer/orders` – List of all orders with status badges.
- `/buyer/orders/:id` – Detailed order timeline (status history).

**Seller** (`/seller` base path)
- `/seller/dashboard` – Store summary, income overview.
- `/seller/store` – Create/Edit store name.
- `/seller/products` – Manage products (List, Create, Edit, Delete).
- `/seller/orders` – Incoming orders (Sedang Dikemas). Action button to "Process" (-> Menunggu Pengirim).
- `/seller/reports` – Income report, completed orders.

**Driver** (`/driver` base path)
- `/driver/dashboard` – Active job status, earnings summary.
- `/driver/jobs` – Available delivery jobs (Menunggu Pengirim).
- `/driver/jobs/:id` – Job detail with "Take Job" button.
- `/driver/history` – Completed deliveries with earnings.

**Admin** (`/admin` base path)
- `/admin/dashboard` – Monitoring cards (Users, Stores, Orders, Overdue).
- `/admin/vouchers` – List, Create, and Detail views for Vouchers.
- `/admin/promos` – List, Create, and Detail views for Promos.
- `/admin/overdue` – List of overdue orders with status.
- `/admin/simulate` – Button/Trigger to simulate "Next Day" for overdue testing.

---

## 6. Functional Requirements (Per Level)

### Level 1 – Public Marketplace, Auth, Reviews

#### F-1.1 Landing Page (`/`)
- **Hero Section:** Big headline "Belanja Mudah di SEAPEDIA", CTA "Mulai Belanja" (links to `/products`).
- **Featured Products:** Horizontal scroll or grid of products (uses public API).
- **Application Reviews:** Displays 5 latest reviews. Shows rating, name, comment.
- **Navbar:** Logo (left). If guest: Login/Register buttons (right). If logged in: Avatar/Profile dropdown.

#### F-1.2 Product Listing (`/products`)
- **Grid:** Mobile: 2 columns. Desktop: 4 columns.
- **Card:** Product Image (placeholder), Name (14px bold), Price (16px bold indigo), Store Name (12px grey).
- **Search Bar:** Debounced search input filtering by product name.

#### F-1.3 Product Detail (`/products/:id`)
- **Image:** Full-width carousel.
- **Info:** Name (H2), Price (H1), Store link.
- **Stock:** Display "Tersisa X" with warning color if low (<5).
- **Action:** If Buyer role -> "Add to Cart" button (Sticky bottom). If Guest -> "Login to Buy" button.

#### F-1.4 Authentication Flow (`/login`, `/register`, `/choose-role`)
- **Login:** POST `/api/auth/login`. On success, save token to Zustand and localStorage.
- **Register:** POST `/api/auth/register`. User selects roles via toggle chips.
- **Role Selection:** After login, if `roles.length > 1`, redirect to `/choose-role`. User clicks a role card, sets `activeRole`, redirects to respective dashboard (`/buyer`, `/seller`, etc.). If only one role, auto-select.

#### F-1.5 Application Reviews
- **Form:** Name (if guest), Rating (Star picker), Comment (textarea).
- **Submission:** POST `/api/reviews`. Validate rating 1-5. Disable submit button after successful submission, show success toast.
- **Display:** Sanitize `comment` using **DOMPurify** before rendering to prevent XSS.

#### F-1.6 Reusable Components
- **Button:** Variants: `default` (indigo), `outline` (grey), `ghost`. Size: `sm`, `default`, `lg`.
- **Input:** Label, error message display below.
- **Card:** Standard white card with shadow.
- **Navigation:** Conditionally render BottomNav (mobile) or Sidebar (desktop) based on device width.

---

### Level 2 – Seller Experience

#### F-2.1 Store Management
- **Page:** `/seller/store`.
- **Create/Edit Form:** Single field: Store Name. Validation: Required, unique (error from API).
- **Display:** If store exists, show "Nama Toko: X" and enable edit mode.

#### F-2.2 Product Management
- **Page:** `/seller/products` (Table/Grid).
- **Create Product Modal:** Form: Name, Description (textarea), Price, Stock.
- **Edit Product Modal:** Pre-fill data, PUT request on submit.
- **Delete:** Confirmation dialog before DELETE request.
- **Constraints:** Only Seller products visible. Error if trying to access product from another store.

---

### Level 3 – Buyer Wallet, Cart, Checkout

#### F-3.1 Wallet & Addresses
- **Wallet Page (`/buyer/wallet`):** Shows balance (large font). "Top Up" button. Modal with amount input. Dispatches POST `/api/buyer/wallet/topup` (dummy).
- **Transaction History:** List with color-coded amounts (Green for Top-up/Refund, Red for Payment).
- **Address Page (`/buyer/addresses`):** CRUD list. Fields: Label, Recipient, Phone, Address Line, City, Postal Code. Primary address toggle.

#### F-3.2 Cart & Single-Store Rule
- **Cart Page (`/buyer/cart`):** 
  - Shows store name at the top.
  - If adding product from Store B while cart has Store A, display a toast: "Keranjang hanya boleh berisi 1 toko. Kosongkan keranjang terlebih dahulu?" with a "Clear Cart" action.
  - Quantity stepper (+/-). Delete item (trash icon).
  - **Summary:** Subtotal, delivery fee estimate (minimum), "Checkout" button.

#### F-3.3 Checkout Flow
- **Step 1 (Address):** Select/Add shipping address.
- **Step 2 (Delivery):** Radio buttons: Instant, Next Day, Regular (prices differ).
- **Step 3 (Discount):** Input field for Voucher/Promo code. Apply button calls validation API. Show discount amount if valid.
- **Step 4 (Summary):** Pre-checkout display:
  ```
  Subtotal:    Rp XXX
  Diskon:      -Rp XXX
  Ongkir:      Rp XXX
  PPN 12%:     Rp XXX
  Total:       Rp XXX
  ```
- **Confirm:** POST `/api/buyer/checkout`. Handles loading state. On success, redirect to `/buyer/orders`.

---

### Level 4 – Discounts & Seller Order Processing

#### F-4.1 Discount Application
- **Checkout Input:** Implement validation feedback (green border for valid, red for invalid). Show "Voucher Applied" tag.
- **Voucher/Promo Admin UI (Admin):** Forms to generate codes with expiry date and usage limit.

#### F-4.2 Seller Processing Action
- **Incoming Orders Page (`/seller/orders`):** Tab filter: "Sedang Dikemas" vs "All".
- **Action Button:** "Proses Pesanan" (Process Order). On click:
  - PUT `/api/seller/orders/:id/process`.
  - Optimistic update: Move card to "Menunggu Pengirim" list immediately.

#### F-4.3 Reports UI
- **Buyer Spending:** Chart (Bar chart using Recharts or simple list) showing monthly spending.
- **Seller Income:** List showing orders with "Pesanan Selesai" status and the final total.

---

### Level 5 – Delivery & Driver Workflow

#### F-5.1 Driver Job Board
- **Page:** `/driver/jobs`. 
  - List view showing: Order ID, Pickup Address (Store), Destination (Buyer Address), Delivery Method (Instant/Next Day/Regular).
  - Badge: "Available" (green).
  - Clicking a card navigates to `/driver/jobs/:id`.

#### F-5.2 Take & Complete Job
- **Detail Page:** Map placeholder or address details. 
- **Action Button:** "Ambil Pekerjaan" (Take Job). PATCH `/api/driver/jobs/:id/take`. Updates status to "Sedang Dikirim".
- **Completion:** Driver receives a "Selesai" button on their active job. PATCH `/api/driver/jobs/:id/complete`. Updates to "Pesanan Selesai".

#### F-5.3 Delivery Tracking (Buyer/Seller)
- **Order Detail (`/buyer/orders/:id`):** Add a visual "Status Stepper":
  1. Sedang Dikemas (Checkmark)
  2. Menunggu Pengirim (Checkmark/Active)
  3. Sedang Dikirim (Active)
  4. Pesanan Selesai (Upcoming)
- **Driver Info:** If status is "Sedang Dikirim", display the Driver's name and phone (if available from API).

---

### Level 6 – Admin Monitoring & Overdue Handling

#### F-6.1 Admin Dashboard Cards
- **Grid layout (2 cols on mobile, 4 on desktop).**
- Cards: Total Users, Total Stores, Total Orders, Pending Orders.
- **Overdue Table:** List all orders where `status = Dikembalikan` OR highlight overdue with "Overdue" red badge.

#### F-6.2 Voucher/Promo Management UI
- **Page:** `/admin/vouchers` (Tabs: Vouchers | Promos).
- **Create Form:** Code, Discount Type (Percentage/Fixed), Value, Min Order, Expiry Date, Usage Limit (for Voucher).
- **List:** Displays code, value, expiry, remaining quota.

#### F-6.3 Simulate Next Day
- **Admin Action Button:** "Simulasikan Hari Berikutnya" (Simulate Next Day).
- Click triggers POST `/api/admin/simulate-next-day`.
- Show success toast: "Sistem berhasil dimajukan 1 hari. Cek order overdue."
- *UI Feedback:* Display a "Current Simulated Date" in the Admin header to know the system's time.

---

### Level 7 – Security Hardening & Finalization

#### F-7.1 XSS Prevention (Critical)
- **Sanitization Implementation:** In the `ReviewList` component, before injecting `comment` into the DOM:
  ```jsx
  import DOMPurify from 'dompurify';
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment) }} />
  ```
- **Form Validation:** Use `Zod` schemas strictly matching backend Joi:
  - `email`: string.email()
  - `phone`: regex for Indonesian numbers.
  - `price/stock`: positive number.
  - `rating`: min 1 max 5.

#### F-7.2 UI Role Lockdown (RBAC)
- **Protected Routes:** Create a `<ProtectedRoute>` wrapper. It checks `authStore.activeRole`.
  - If trying to access `/seller` but activeRole is `buyer`, redirect to `/buyer/dashboard`.
- **Conditional Rendering:** In the Top Nav, only show "Seller Dashboard" link if `authStore.roles.includes('Seller')`.
- **Logout:** Clear localStorage, reset Zustand store, redirect to `/`.

---

## 7. State Management (Zustand Stores)

### 7.1 Auth Store (`authStore`)
```javascript
{
  user: null,
  token: null,
  roles: [],           // ['Buyer', 'Seller']
  activeRole: null,    // 'Buyer'
  setAuth: (data) => void,
  setActiveRole: (role) => void,
  logout: () => void
}
```

### 7.2 Cart Store (`cartStore`)
```javascript
{
  items: [],           // [{ productId, name, price, quantity, storeId }]
  storeId: null,       // Current cart store
  totalItems: 0,
  totalPrice: 0,
  addItem: (product) => void, // Checks storeId conflict
  removeItem: (id) => void,
  clearCart: () => void,
  syncCart: () => void // Fetch from API on login
}
```

### 7.3 UI Store (`uiStore`)
```javascript
{
  sidebarOpen: false,
  isLoading: false,
  notifications: [],
  addNotification: (msg, type) => void,
  toggleSidebar: () => void
}
```

---

## 8. API Integration Strategy (TanStack Query)

- **Query Keys:** Use specific keys for invalidation.
  - `['products']`, `['products', id]`
  - `['orders', 'buyer']`, `['orders', 'seller']`
  - `['wallet']`, `['cart']`
  - `['driver', 'jobs']`
- **Mutations:** Utilize `useMutation` for POST/PUT/DELETE.
  - On successful `checkout`, invalidate `['cart']` and `['orders', 'buyer']`.
  - On successful `processOrder`, invalidate `['orders', 'seller']`.
- **Error Handling:** Global Axios interceptor catches 401/403. If 401, trigger `authStore.logout()` and redirect to login.

---

## 9. Performance & SEO (Optional Bonus)

- **Lazy Loading:** Use `React.lazy()` for Dashboard pages to reduce initial bundle size.
- **Image Optimization:** Serve images via CDN or compress local assets.
- **PWA:** (Optional) Add manifest.json and service worker for better mobile experience.

---

## 10. Appendix: UI Copy (IDs & Placeholders)

- **Store Name Placeholder:** "Toko Keren Kamu" (in Store form).
- **Empty Cart:** "Keranjang kamu kosong, yuk isi dengan produk favorit!"
- **No Jobs (Driver):** "Belum ada pesanan siap kirim, cek lagi nanti."
- **Overdue Badge:** "LEWAT BATAS" (Red background).

---

**Final Note:** This Frontend PRD ensures every button, card, and API call aligns with the SEAPEDIA backend logic. The focus on "white primary" and "mobile-first" ensures the UI remains elegant and functional across all roles.
```