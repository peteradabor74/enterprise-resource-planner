# Enterprise Resource Planner (ERP)

A modular Enterprise Resource Planning system built with a TypeScript/Express backend, a React frontend, and a MySQL database.

## 🚀 Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS (or your UI library)
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL
- **ORM:** Prisma / Sequelize (Optional - change if applicable)

## 📦 Features & Modules
- **User Authentication:** Role-based access control (Admin, Manager, Employee).
- **Inventory Management:** Stock tracking, supplier logs, and reorder alerts.
- **Financial Accounting:** Invoicing, expense tracking, and balance sheets.
- **HR/Payroll:** Employee profiles, attendance tracking, and payroll processing.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd enterprise-resource-planner
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend root directory:
   ```env
   PORT=5000
   DATABASE_URL="mysql://username:password@localhost:3306/erp_db"
   JWT_SECRET="your_secret_key"
   ```

3. **Install Backend Dependencies & Start:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Install Frontend Dependencies & Start:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🗺️ Project Structure
```text
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   └── package.json
├── frontend/         # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
└── README.md
```
