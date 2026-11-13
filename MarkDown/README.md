# 💳 Meridian Credit - Credit Card Processing System

A modern, enterprise-inspired **Credit Card Processing System Simulator** built using **React**, **ASP.NET Core Web API (.NET 8)**, and **Microsoft SQL Server**.

Meridian Credit simulates the complete lifecycle of a credit card transaction—from customer authentication to payment authorization, fraud detection, and transaction history—without connecting to any real banking or payment gateway APIs.

This project is developed for educational purposes as part of a **Software Engineering** course and demonstrates secure software design, layered architecture, RESTful APIs, authentication, authorization, and database management.

---

# 📌 Project Overview

Meridian Credit simulates how credit card payments are processed in real-world systems.

Unlike traditional CRUD applications, Meridian Credit models the interaction between multiple entities including customers, merchants, administrators, and a simulated payment gateway.

The system validates payment requests, performs security checks, verifies card information, processes transactions, records transaction history, and generates reports.

All payment processing is completely simulated.

No real banks, payment gateways, or financial APIs are used.

---

# 🎯 Objectives

- Simulate the complete credit card payment workflow.
- Demonstrate enterprise software architecture.
- Implement secure authentication and authorization.
- Design a relational database using SQL Server.
- Develop REST APIs using ASP.NET Core.
- Build a responsive modern frontend using React.
- Simulate fraud detection mechanisms.
- Generate transaction reports and payment receipts.
- Apply Software Engineering principles throughout development.

---

# 👥 User Roles

## Customer

- Register and Login
- Manage profile
- Add and manage credit cards
- View available balance
- Make payments
- View transaction history
- Download payment receipts
- Receive email notifications

---

## Merchant

- Register and Login
- Receive customer payments
- View payment history
- View sales dashboard
- Search received transactions

---

## Administrator

- Manage users
- Manage merchants
- Manage credit cards
- View all transactions
- Block or unblock cards
- Monitor suspicious transactions
- Generate reports
- Access analytics dashboard

---

# 💳 Payment Workflow

```text
Customer

↓

Merchant

↓

Payment Gateway (Simulation)

↓

Card Validation

↓

Balance Verification

↓

Fraud Detection

↓

Approve / Reject

↓

Update Balance

↓

Store Transaction

↓

Send Email Notification

↓

Generate Receipt
```

---

# ✨ Features

### Authentication

- Secure Registration
- Login
- JWT Authentication
- Role-Based Authorization
- Password Hashing

### Customer Features

- Credit Card Management
- Payment Processing
- Transaction History
- Balance Tracking
- Payment Receipts

### Merchant Features

- Payment Dashboard
- Transaction Reports
- Sales Statistics

### Admin Features

- User Management
- Merchant Management
- Card Management
- Fraud Monitoring
- Analytics Dashboard

### Fraud Detection

- Expired Card Detection
- Blocked Card Detection
- Insufficient Balance Detection
- Large Transaction Detection
- Rapid Transaction Detection

### Notifications

- Email OTP Verification
- Payment Confirmation Email
- Transaction Alerts
- In-App Notifications

---

# 🛠 Technology Stack

## Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Zustand
- React Hook Form
- Zod
- Axios
- Chart.js
- Lucide React

## Backend

- ASP.NET Core Web API (.NET 8)
- C#
- Entity Framework Core
- ASP.NET Core Identity
- JWT Authentication
- BCrypt
- Serilog
- Swagger

## Database

- Microsoft SQL Server
- Entity Framework Core

## Email Service

- SMTP2GO

## PDF Generation

- QuestPDF

## API Testing

- Postman

## Version Control

- Git
- GitHub

---

# 🏗 Architecture

The project follows a Layered Architecture.

```text
React Frontend

↓

REST API

↓

ASP.NET Core Web API

↓

Controllers

↓

Services

↓

Repositories

↓

Entity Framework Core

↓

SQL Server
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Secure API Endpoints
- Server-Side Validation
- SQL Injection Protection
- Environment Variables
- Secure Password Storage

---

# 📁 Project Structure

```text
Meridian Credit/

├── client/
├── server/
├── database/
├── docs/
├── README.md
├── TECH_STACK.md
├── DO_AND_DONT.md
```

---

# 🚀 Planned Modules

- Authentication Module
- User Module
- Merchant Module
- Card Module
- Payment Module
- Transaction Module
- Fraud Detection Module
- Notification Module
- Dashboard Module
- Reporting Module

---

# 📧 Email Service

SMTP2GO will be used to send:

- OTP Verification
- Payment Confirmation
- Transaction Notifications
- Password Reset Emails

---

# 📊 Reports

The system will generate:

- Transaction Reports
- Customer Reports
- Merchant Reports
- Fraud Reports
- Payment Receipts (PDF)

---

# ⚠ Disclaimer

Meridian Credit is an academic project developed for educational purposes.

No real credit card information, banking systems, payment gateways, or financial institutions are connected to this application.

All transactions, balances, cards, and payment processing are simulated.

---

# 👨‍💻 Development

Although the project is intended for a team of 5–6 members, the complete system architecture, design, implementation, and documentation are being developed individually.

---

# 📜 License

This project is intended solely for educational and learning purposes.
