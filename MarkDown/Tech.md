# Tech Stack

## Overview

This project is a **Credit Card Processing System Simulator** developed using the Microsoft technology stack for the backend and a modern React-based frontend. The system simulates the complete lifecycle of a credit card transaction, including authentication, payment processing, fraud detection, and transaction management, without integrating with real banking APIs.

---

# Frontend

## Framework

- **React.js 19**
- **TypeScript**
- **Vite**

### Why?

- Fast development environment
- Component-based architecture
- Type safety using TypeScript
- Excellent performance
- Easy integration with REST APIs

---

## Styling

- **Tailwind CSS**
- **Shadcn UI**

### Why?

- Modern responsive UI
- Utility-first CSS framework
- Professional and reusable UI components
- Consistent design system

---

## State Management

- **Zustand**

### Why?

- Lightweight
- Easy to learn
- Simple global state management
- Perfect for medium-sized applications

---

## Form Handling

- **React Hook Form**
- **Zod**

### Why?

- Efficient form validation
- Better user experience
- Type-safe validation
- Reduced re-rendering

---

## HTTP Client

- **Axios**

### Why?

- Simplified API communication
- Request and response interceptors
- Error handling
- Authentication token management

---

## Data Visualization

- **Chart.js**

### Used For

- Transaction statistics
- Monthly payment reports
- Fraud analysis
- User dashboard analytics

---

## Icons

- **Lucide React**

### Why?

- Lightweight
- Modern icon library
- Seamless React integration

---

# Backend

## Framework

- **ASP.NET Core Web API (.NET 8 LTS)**

### Language

- **C# 12**

### Why?

- Enterprise-grade framework
- High performance
- Secure REST API development
- Cross-platform support
- Industry standard for financial applications

---

## ORM (Object Relational Mapper)

- **Entity Framework Core 8**

### Why?

- Simplifies database operations
- LINQ support
- Code First development
- Database migrations
- Strong relationship management

---

## Authentication & Authorization

- **JWT (JSON Web Token)**
- **ASP.NET Core Identity**
- **BCrypt Password Hashing**

### Why?

- Secure authentication
- Role-based authorization
- Encrypted password storage

---

## Validation

- **Data Annotations**
- **FluentValidation** *(Optional)*

### Why?

- Server-side validation
- Clean API responses
- Better maintainability

---

## Logging

- **Serilog**

### Why?

- Centralized logging
- Error tracking
- File and console logging

---

## API Documentation

- **Swagger (OpenAPI)**

### Why?

- Interactive API testing
- Automatic documentation
- Simplifies frontend integration

---

# Database

## Database Management System

- **Microsoft SQL Server 2022 Express**

### Database Tool

- **SQL Server Management Studio (SSMS)**

### Why?

- Reliable relational database
- Strong ACID compliance
- Excellent support for transactional systems
- Widely used in enterprise applications

---

# Email Service (Optional)

- **MailKit**

### Used For

- OTP simulation
- Payment confirmation
- Registration confirmation

---

# PDF Generation

- **QuestPDF**

### Used For

- Payment receipts
- Transaction invoices
- Reports

---

# API Testing

- **Postman**

### Why?

- API endpoint testing
- Request validation
- Authentication testing

---

# Version Control

- **Git**
- **GitHub**

### Why?

- Source code management
- Team collaboration
- Version history

---

# Development Tools

| Tool                         | Purpose                         |
|------------------------------|---------------------------------|
| Visual Studio 2022 Community | Backend Development             |
| Visual Studio Code           | Frontend Development            |
| [SQL Server Management Studio| Database Management             |
|(SSMS)]                       |                                 |
| Postman                      | API Testing                     |
| Git                          | Version Control                 |
| GitHub                       | Repository Hosting              |

---

# Deployment

## Frontend

- Vercel

## Backend

- Azure App Service *(Recommended)*
- IIS *(Alternative for Windows Server)*

## Database

- Microsoft SQL Server
- Azure SQL Database *(Optional Cloud Deployment)*

---

# Project Architecture

```
React + TypeScript + Vite
            │
        REST API
            │
 ASP.NET Core Web API (.NET 8)
            │
────────────────────────────────────
Authentication Module
User Module
Card Module
Merchant Module
Payment Module
Transaction Module
Fraud Detection Module
Admin Module
Notification Module
Reporting Module
────────────────────────────────────
            │
    Entity Framework Core 8
            │
      Microsoft SQL Server
```

---

# Security

- JWT Authentication
- Role-Based Authorization
- Password Hashing (BCrypt)
- HTTPS
- CORS
- Input Validation
- SQL Injection Protection (Entity Framework Core)
- Secure Password Storage

---

# Third-Party Libraries

## Frontend

- React
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

- ASP.NET Core Web API
- Entity Framework Core
- ASP.NET Core Identity
- JWT Authentication
- BCrypt.Net
- Serilog
- Swagger
- MailKit
- QuestPDF

---

# Summary

| Layer                        | Technology                      |
|------------------------------|---------------------------------|
| Frontend Framework           | React.js 19 + TypeScript + Vite |
| UI Framework                 | Tailwind CSS                      |
| Component Library            | Shadcn UI                       |
| State Management             | Zustand                         |
| Form Handling                | React Hook Form + Zod           |
| HTTP Client                  | Axios                           |
| Charts                       | Chart.js                        |
| Backend Framework            | ASP.NET Core Web API (.NET 8 LTS) |
| Programming Language         | C# 12                           |
| ORM                          | Entity Framework Core 8         |
| Database                     | Microsoft SQL Server 2022 Express |
| Authentication               | JWT + ASP.NET Core Identity     |
| Password Hashing             | BCrypt                          |
| API Documentation            | Swagger (OpenAPI)               |
| Logging                      | Serilog                         |
| Email Service                | MailKit                         |
| PDF Generation               | QuestPDF                        |
| API Testing                  | Postman                         |
| Version Control              | Git + GitHub                    |
| Deployment                   | Vercel + Azure App Service + SQL Server |