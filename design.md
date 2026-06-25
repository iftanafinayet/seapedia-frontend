# Design System & UI/UX Guidelines - SEAPEDIA

**Version:** 2.0
**Focus:** Quiet Premium, Mobile-First, Minimalist, Elegant

---

## 1. Design Philosophy

SEAPEDIA is a multi-role marketplace. The interface must inspire **trust**, **clarity**, and **professionalism**.

- **Quiet Premium**: Minimalism with heavy whitespace, balanced proportions, restrained structural grid.
- **Mobile-First Architecture**: All designs start from a 375px viewport. Touch targets are generously sized (min 44px). Navigation is thumb-friendly.
- **Subtle Depth**: Ultra-soft shadows (0 1px 3px rgba(0,0,0,0.04)) and gentle glassmorphism layering instead of heavy borders.
- **Emotional Response**: Calm, reliability, precision.

---

## 2. Design System

### 2.1 Color Palette (Material Design 3-inspired)

#### Surface / Background
| Role | Hex Code | Token |
| :--- | :--- | :--- |
| Background / Surface | `#fcf8ff` | `surface`, `background` |
| Surface Container Lowest | `#ffffff` | `surface-container-lowest` |
| Surface Container Low | `#f5f2ff` | `surface-container-low` |
| Surface Container | `#f0ecf9` | `surface-container` |
| Surface Container High | `#eae6f4` | `surface-container-high` |
| Surface Container Highest | `#e4e1ee` | `surface-container-highest` |

#### Primary (Indigo)
| Role | Hex Code | Token |
| :--- | :--- | :--- |
| Primary | `#3525cd` | `primary` |
| Primary Container | `#4f46e5` | `primary-container` |
| On Primary | `#ffffff` | `on-primary` |
| On Primary Container | `#dad7ff` | `on-primary-container` |
| Primary Fixed | `#e2dfff` | `primary-fixed` |
| Primary Fixed Dim | `#c3c0ff` | `primary-fixed-dim` |

#### Secondary
| Role | Hex Code | Token |
| :--- | :--- | :--- |
| Secondary | `#515f74` | `secondary` |
| Secondary Container | `#d5e3fc` | `secondary-container` |

#### Tertiary
| Role | Hex Code | Token |
| :--- | :--- | :--- |
| Tertiary | `#7e3000` | `tertiary` |
| Tertiary Container | `#a44100` | `tertiary-container` |

#### Semantic
| Role | Hex Code | Token |
| :--- | :--- | :--- |
| Error | `#ba1a1a` | `error` |
| Error Container | `#ffdad6` | `error-container` |
| Success | `#10B981` | `success` |
| Warning | `#F59E0B` | `warning` |
| Info | `#3B82F6` | `info` |

#### Text & Icons
| Role | Hex Code | Token |
| :--- | :--- | :--- |
| On Surface (Primary Text) | `#1b1b24` | `on-surface` |
| On Surface Variant (Secondary) | `#464555` | `on-surface-variant` |
| Outline (Tertiary/Muted) | `#777587` | `outline` |

### 2.2 Typography

**Inter** font family exclusively. Imported via Google Fonts.

**Mobile-First Scale:**
| Style | Size | Weight | Line Height | Token |
| :--- | :--- | :--- | :--- | :--- |
| Headline LG | 24px | 600 | 32px (-0.02em) | `headline-lg` |
| Headline MD | 20px | 600 | 28px (-0.01em) | `headline-md` |
| Body Base | 14px | 400 | 20px | `body-base` |
| Body SM | 12px | 400 | 16px | `body-sm` |
| Label MD | 14px | 500 | 20px | `label-md` |
| Label SM | 11px | 600 | 12px (0.05em) | `label-sm` |

### 2.3 Spacing & Grid

- **Base Unit**: 4px (8px grid system)
- **Gutters (Mobile)**: 16px (px-4)
- **Gutters (Desktop)**: 24px
- **Max Content Width**: 1280px
- **Bottom Nav Height**: 72px
- **Top Bar Height**: 60px
- **Touch Target Min**: 44px

### 2.4 Shapes (Border Radius)

| Size | Value | Usage |
| :--- | :--- | :--- |
| SM | 4px (0.25rem) | Small components, checkboxes |
| DEFAULT | 8px (0.5rem) | Buttons, Inputs |
| MD | 12px (0.75rem) | Cards, containers |
| LG | 16px (1rem) | Large containers |
| XL | 24px (1.5rem) | Modals, sections |
| Full | 9999px | Pills, badges, chips |

### 2.5 Elevation & Depth

- **Level 0 (Base)**: Surface background (#fcf8ff)
- **Level 1 (Cards)**: White bg with ultra-soft shadow (`0 1px 3px rgba(0,0,0,0.04)`)
- **Level 2 (Floating)**: Elevated shadow (`0 10px 25px -5px rgba(0,0,0,0.05)`)
- **Glassmorphism**: White bg at 80% opacity with backdrop-blur(8px)

---

## 3. Components

### 3.1 Cards
- **Background**: White
- **Border Radius**: 12px (rounded-[12px])
- **Shadow**: shadow-card
- **Padding**: 16px (p-4)
- **Glass Variant**: bg-white/80 backdrop-blur-[8px]

### 3.2 Buttons
- **Primary**: bg-primary-container (#4F46E5), text-white, rounded-[8px], h-11, font-semibold
- **Secondary**: bg-white, text-on-surface-variant, border border-outline-variant
- **Ghost**: bg-transparent, text-on-surface-variant
- **Danger**: bg-error, text-white
- **Size SM**: h-9 px-3 text-[13px]
- **Size LG**: h-14 px-8 text-[15px]

### 3.3 Input Fields
- **Border**: 1px solid outline-variant (#c7c4d8)
- **Border Radius**: 8px (rounded-[8px])
- **Focus**: ring-2 ring-primary-container
- **Error**: border-error, focus:ring-error
- **Padding**: px-4 py-3

### 3.4 Bottom Navigation
- **Height**: 72px (including safe-area)
- **Style**: Glassmorphism (bg-white/80 backdrop-blur-[8px])
- **Active**: Primary icon/label with scale-110
- **Inactive**: outline color
- **Shadow**: glass-nav

### 3.5 Sidebar (Desktop)
- **Width**: 240px (w-60)
- **Active State**: 3px primary accent bar on left edge + subtle bg tint

### 3.6 Chips & Filter Pills
- **Inactive**: bg-surface-container-low, text-on-surface-variant, rounded-full
- **Active**: bg-primary-container, text-white, rounded-full

### 3.7 Badges
- **Style**: text-[11px] font-semibold px-2.5 py-1 rounded-full
- **Variants**: success (green), warning (amber), error (red), info (blue), primary (indigo), overdue (solid red)

---

## 4. Layout

### Mobile (< 1024px)
- Single column layout
- 16px side margins (px-4)
- Bottom navigation visible
- Full-width cards

### Desktop (> 1024px)
- Fixed left sidebar (240px)
- Sidebar replaces bottom nav
- Max content width 1280px, centered
- Multi-column grids (2-4 columns)
- Hover effects enabled

---

## 5. Micro-Interactions

- **Loading**: Skeleton shimmer animations (bg-surface-container-high animate-pulse)
- **Toasts**: Slide-up from bottom (mobile), top-right (desktop), dark bg, 3s duration
- **Buttons**: active:scale-[0.98] press effect, smooth 200ms transitions
- **Cards**: hover:shadow-card-hover hover:-translate-y-0.5

---

## 6. Accessibility

- **Contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Focus States**: ring-2 ring-primary-container (never remove outline without custom focus ring)
- **Screen Readers**: aria-labels for icon-only buttons
