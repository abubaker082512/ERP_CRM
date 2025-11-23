# Frontend Design System & Architecture

Based on the provided screenshots, we will implement a modern, dark-themed ERP interface.

## 1. Color Palette
### Dark Theme (Primary)
- **Background**: `#0F172A` (Deep Blue/Slate) - *Derived from the dashboard background*
- **Sidebar/Surface**: `#1E293B` (Lighter Slate)
- **Text Primary**: `#F8FAFC` (White/Off-white)
- **Text Secondary**: `#94A3B8` (Gray)

### Accents
- **Primary Brand**: `#0EA5E9` (Sky Blue) - *Used in buttons/icons*
- **Success**: `#10B981` (Emerald Green) - *Used for positive stats*
- **Warning**: `#F59E0B` (Amber) - *Used for alerts*
- **Danger**: `#EF4444` (Red)

## 2. Typography
- **Font Family**: `Inter` or `Roboto` (Google Fonts)
- **Headings**: Bold, clean, high contrast.
- **Body**: Legible, good spacing for data tables.

## 3. Layout Structure
### Auth Layout (Login)
- **Background**: Light/Gradient or clean solid color (Screenshot 2 shows a light modal on a light background, but we can adapt to dark if preferred, or keep it light for contrast).
- **Card**: Centered, white shadow, clean input fields.

### App Launcher (Home)
- **Grid**: Responsive grid of application icons.
- **Icons**: Colorful, rounded square icons (CRM, Sales, Accounting).
- **Background**: Dark immersive background.

### Main Dashboard Layout
- **Sidebar**: Fixed left navigation (Collapsible).
    - Sections: Sales, CRM, Finance, Logistics, Services, HR.
- **Top Bar**: Breadcrumbs, Global Search, Notifications, User Profile.
- **Content Area**:
    - **KPI Cards**: Top row (Quotations, Orders, Revenue).
    - **Charts**: Line/Bar charts for trends.
    - **Tables**: Data grids for records.

## 4. Tech Stack (Frontend)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (for rapid UI development matching the design)
- **Icons**: Lucide React or Heroicons
- **Charts**: Recharts or Chart.js
- **State Management**: Zustand or React Context
- **Data Fetching**: TanStack Query (React Query)
