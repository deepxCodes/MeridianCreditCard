# Project Overview

## Project Title

**Meridian Credit – Credit Card Processing System**

---

# Introduction

Meridian Credit is a web-based Credit Card Processing System Simulator developed to demonstrate the complete lifecycle of a credit card transaction in a secure and controlled environment.

The system mimics how online credit card payments are processed between customers, merchants, and a payment gateway without involving any real financial institutions or payment service providers.

Meridian Credit focuses on software engineering principles, enterprise application development, secure authentication, transaction processing, fraud detection, and reporting. It is designed as an educational project to understand the internal workflow of digital payment systems.

---

# Problem Statement

The rapid growth of e-commerce and digital payments has increased the demand for secure and efficient payment processing systems. Understanding how these systems work is essential for software engineers developing financial applications.

However, integrating with real banking systems requires legal compliance, security certifications, and access to proprietary APIs, making it unsuitable for academic projects.

Meridian Credit addresses this challenge by simulating the behavior of a real-world credit card processing system while maintaining a safe, offline, and educational environment.

---

# Project Goal

To develop a secure, scalable, and modular web application that simulates credit card payment processing using modern web technologies and software engineering best practices.

---

# Objectives

- Simulate the lifecycle of a credit card transaction.
- Implement secure user authentication and authorization.
- Demonstrate layered software architecture.
- Design and implement a normalized relational database.
- Develop RESTful APIs using ASP.NET Core.
- Build a responsive and user-friendly web interface.
- Simulate fraud detection rules.
- Generate transaction history and analytical reports.
- Apply secure coding practices throughout the application.

---

# Scope

The system simulates the interaction between customers, merchants, administrators, and a payment gateway.

The project includes:

- User registration and login
- Credit card management
- Simulated payment processing
- Transaction management
- Fraud detection
- Dashboard analytics
- Email notifications
- PDF receipt generation
- Administrative controls

The project does **not** include:

- Real payment gateways
- Banking APIs
- Live credit card processing
- Financial settlements
- UPI or cryptocurrency payments

---

# Target Users

The application supports three user roles.

## Customer

Customers can:

- Register and log in
- Manage their profile
- Add and manage credit cards
- View available balance
- Make payments
- View transaction history
- Download payment receipts
- Receive OTP and payment notifications

---

## Merchant

Merchants can:

- Register and log in
- Receive customer payments
- View received transactions
- Access sales reports
- Monitor payment history

---

## Administrator

Administrators can:

- Manage users
- Manage merchants
- Manage credit cards
- Monitor transactions
- Block or unblock cards
- Detect suspicious activity
- Generate reports
- Access system analytics

---

# System Workflow

The payment process follows the sequence below.

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

Save Transaction

↓

Generate Receipt

↓

Send Email Notification
```

---

# Core Modules

The application consists of the following modules:

- Authentication Module
- User Management Module
- Merchant Module
- Card Management Module
- Payment Processing Module
- Transaction Module
- Fraud Detection Module
- Notification Module
- Dashboard Module
- Reporting Module

---

# Key Features

## Authentication

- User Registration
- Secure Login
- JWT Authentication
- Role-Based Authorization

---

## Card Management

- Add Credit Card
- View Saved Cards
- Block / Unblock Cards
- Balance Management

---

## Payment Processing

- Payment Simulation
- Card Validation
- Balance Verification
- Payment Authorization
- Transaction Recording

---

## Fraud Detection

The system identifies potentially suspicious transactions using predefined business rules, including:

- High-value transactions
- Expired cards
- Blocked cards
- Insufficient balance
- Rapid consecutive transactions

---

## Dashboard

Different dashboards are provided for:

- Customers
- Merchants
- Administrators

Each dashboard displays role-specific information and analytics.

---

## Notifications

The application sends email notifications using SMTP2GO for:

- OTP Verification
- Payment Confirmation
- Password Reset
- Transaction Alerts

In-app notifications are also provided for important system events.

---

# Technology Overview

| Layer | Technology |
|--------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + Shadcn UI |
| Backend | ASP.NET Core Web API (.NET 8) |
| Language | C# |
| ORM | Entity Framework Core (Code First) |
| Database | Microsoft SQL Server |
| Authentication | JWT + ASP.NET Core Identity |
| Email | SMTP2GO |
| PDF | QuestPDF |

---

# Software Architecture

The project follows a layered architecture.

```text
React Frontend
        │
REST API
        │
Controllers
        │
Services
        │
Repositories
        │
Entity Framework Core
        │
SQL Server
```

Each layer has a single responsibility, improving maintainability, scalability, and testability.

---

# Assumptions

- All payment transactions are simulated.
- Users interact through a web browser.
- Email services are available through SMTP2GO.
- Internet connectivity is required for email delivery.
- SQL Server stores all application data securely.

---

# Constraints

- No real banking APIs are integrated.
- No actual financial transactions occur.
- Card information is dummy data created for simulation.
- Fraud detection is rule-based rather than AI-driven.
- The project is intended for educational purposes only.

---

# Expected Outcomes

Upon completion, Meridian Credit will demonstrate:

- Secure authentication and authorization
- Modern full-stack web development
- Enterprise-style layered architecture
- RESTful API development
- Database design using SQL Server
- Secure transaction processing
- Fraud detection simulation
- Report generation
- Professional software engineering documentation

---

# Conclusion

Meridian Credit provides a realistic simulation of a modern credit card processing system while remaining safe, educational, and manageable for academic development.

The project emphasizes clean architecture, secure coding practices, modular design, and industry-standard technologies, making it an excellent demonstration of full-stack software engineering principles.