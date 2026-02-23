# 🏢 ERP Management Backend System

A scalable, enterprise-grade ERP backend built with **Node.js, Express, and MongoDB**.  
Designed using a **modular monolith architecture** to manage multiple business domains such as **E-Commerce, WMS, CRM, HRMS, Accounting, and Invoicing** within a unified platform.

---

## 🔗 Quick Links

- 🌐 Production API: https://erp-system-lime.vercel.app
- 📘 Postman Documentation: https://documenter.getpostman.com/view/38670371/2sB3BKDnhJ
- 🧪 Local API: http://localhost:3000

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏛️ Architecture](#-architecture)
- [🧠 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [🌐 API Documentation](#-api-documentation)
- [🧩 System Modules](#-system-modules)
- [🔧 Development Guidelines](#-development-guidelines)
- [📈 Future Enhancements](#-future-enhancements)
- [👨‍💻 Author](#-author)

---

## 🎯 Overview

**ERP System Backend** is a comprehensive backend solution that manages core business operations including:

- E-Commerce Management
- Warehouse & Inventory (WMS)
- Accounting & Finance
- CRM (Customer & Supplier Management)
- HRMS (Employees & Payroll)
- Orders, Invoices & Quotations

The system follows a **clean layered architecture** with centralized services, validations, and sanitization to ensure scalability, performance, and maintainability.

---

## ✨ Key Features

| Feature                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| 🔐 Authentication      | JWT Authentication & Role-Based Access Control |
| 🏗️ Architecture        | Modular Monolith with layered structure        |
| 🛒 E-Commerce          | Products, Variants, Orders, Coupons, Cart      |
| 📦 WMS                 | Inventory, Stock Movements, Warehouses         |
| 💰 Accounting          | Transactions, Expenses, Financial Records      |
| 👥 CRM                 | Customers & Suppliers Management               |
| 🧑‍💼 HRMS                | Employees, Roles, Permissions, Payroll         |
| 📊 Reports & Analytics | Real-time business insights                    |
| 🛡️ Security            | Helmet, Rate Limit, Mongo Sanitize, HPP        |
| 🔍 API Features        | Pagination, Filtering, Sorting, Searching      |

---

## 🏛️ Architecture

```bash
ERP-System/
│
├── modules/                 # Core Business Modules
│   ├── e-commerce/           # Products, Orders, Cart, Coupons
│   ├── wms/                 # Inventory, Movements, Warehouses
│   ├── accounting/          # Expenses, Transactions, Finance
│   ├── crm/                 # Customers & Suppliers
│   ├── hrms/                # Employees & Payroll
│   └── auth/                # Users, Roles & Permissions
│
├── shared/                  # Shared Layered Logic
│   ├── controllers/
│   ├── services/
│   ├── validators/
│   └── sanitize/
│
├── middlewares/             # Global Middlewares
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── securityMiddleware.js
│
├── utils/                   # Reusable Utilities
│   ├── servicesHandler.js
│   ├── apiFeatures.js
│   ├── sanitizeData.js
│   └── loggerService.js
│
├── config/                  # App Configuration
│   ├── database.js
│   ├── environment.js
│   └── redis.js
│
├── server.js                # Application Entry Point
├── package.json
└── README.md
🧠 Technology Stack
Layer	Technology
Runtime	Node.js
Framework	Express.js
Database	MongoDB + Mongoose
Caching	Redis (Optional)
Authentication	JWT
Validation	express-validator
Security	Helmet, HPP, Rate Limit
Image Handling	Sharp + Cloud Storage
Architecture	Modular Monolith (MVC Layers)
🚀 Quick Start
Prerequisites

Node.js 18+

MongoDB (Local or Atlas)

npm or yarn

1️⃣ Install Dependencies
npm install
2️⃣ Configure Environment
cp .env.example .env
# Update environment variables
3️⃣ Start Application

Development:

npm run dev

Production:

npm run start:prod
🌐 API Documentation
Base URL
https://erp-system-lime.vercel.app
API Versioning
/api/v1
Health Check
GET /api/v1/health

Example Response:

{
  "status": "success",
  "message": "🚀 ERP API is running!",
  "timestamp": "2026-01-01T10:00:00.000Z"
}
🧩 System Modules
🛒 E-Commerce Module

Products & Variants Management

Categories, Brands & Subcategories

Cart & Coupon System

Orders & Checkout Workflow

📦 WMS (Warehouse Management System)

Inventory Items

Stock Movements (onHand / reserved / damaged)

Multi-Warehouse Transfers

Storage Locations & Zones

💰 Accounting Module

Expense Tracking

Financial Transactions

Reports & Balance Calculations

👥 CRM Module

Customer Management

Supplier Management

Relationship Tracking

🧑‍💼 HRMS Module

Employees & Roles

Permissions & Access Control

Payroll & Attendance (Planned)

📑 Invoice & Quotation Module

Invoice Generation

Quotes Management

Order Financial Linking

🔧 Development Guidelines
Architecture Rules

Controller: Request & Response only 🎯

Service: Business Logic & Validations 🧠

Validator: Input validation via express-validator 🧪

Sanitize: Unified response formatting 🧹

Shared servicesHandler for reusable CRUD logic ⚙️

Dedicated logger per module 📜

Available Scripts
Command	Description
npm run dev	Start development server
npm run start:prod	Start production server
npm run lint	Run ESLint
npm run format	Format code with Prettier
npm test	Run test suite
📈 Future Enhancements

🔔 Notification System

📊 Advanced Analytics Dashboard

📦 Batch & Expiry Tracking (WMS)

🧾 Full Accounting Ledger

🧠 AI-powered Business Insights

👨‍💻 Author

Kareem Emad
Backend Engineer | Node.js | ERP Systems Architect 🚀
```
