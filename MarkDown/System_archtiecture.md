# SYSTEM_ARCHITECTURE.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# 1. Introduction

Meridian Credit follows a **Layered Architecture** combined with **RESTful APIs**, **Dependency Injection**, and the **Repository Pattern**.

The architecture separates presentation, business logic, and data access into independent layers, improving maintainability, scalability, testability, and readability.

The system simulates a complete credit card payment lifecycle without integrating with any real banking infrastructure.

---

# 2. Architectural Goals

The architecture is designed to achieve the following objectives:

- Separation of concerns
- High maintainability
- Scalability
- Security
- Testability
- Loose coupling
- High cohesion
- Code reusability
- Enterprise-ready structure

---

# 3. High-Level Architecture

```
+----------------------------------------------------+
|                React Frontend (Vite)               |
|----------------------------------------------------|
| Pages | Components | Zustand | Axios | Tailwind    |
+--------------------------+-------------------------+
                           |
                           | HTTPS / REST API
                           |
+--------------------------v-------------------------+
|          ASP.NET Core Web API (.NET 8)             |
|----------------------------------------------------|
| Controllers                                        |
| Services                                           |
| Repositories                                       |
| Internal Services                                  |
+--------------------------+-------------------------+
                           |
                           |
+--------------------------v-------------------------+
|          Entity Framework Core (Code First)        |
+--------------------------+-------------------------+
                           |
                           |
+--------------------------v-------------------------+
|             Microsoft SQL Server                   |
+----------------------------------------------------+
```

---

# 4. Layered Architecture

The backend follows a strict layered architecture.

```
Presentation Layer
        │
        ▼
Controller Layer
        │
        ▼
Service Layer
        │
        ▼
Repository Layer
        │
        ▼
Database Layer
```

Each layer has a single responsibility.

---

# 5. Presentation Layer

## Responsibilities

- Render UI
- Capture user input
- Client-side validation
- API communication
- Navigation
- State management

### Technologies

- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Zustand
- Axios
- React Hook Form
- Zod

---

# 6. Controller Layer

Controllers are responsible for:

- Receiving HTTP requests
- Validating request models
- Calling service methods
- Returning HTTP responses

Controllers **must not contain business logic**.

Example:

```
POST /api/payment

↓

PaymentController

↓

PaymentService
```

---

# 7. Service Layer

The Service Layer contains all business logic.

Responsibilities include:

- Payment validation
- Fraud detection
- Card validation
- Transaction processing
- Authentication
- Email notifications
- Report generation

Every service must have an interface.

Example:

```
IPaymentService

↓

PaymentService
```

---

# 8. Repository Layer

Repositories isolate database access.

Responsibilities:

- CRUD operations
- LINQ queries
- Entity retrieval
- Persistence

Pattern used:

```
IGenericRepository<T>

↓

GenericRepository<T>

↓

ICardRepository

↓

CardRepository
```

Business logic is not allowed in repositories.

---

# 9. Database Layer

Database responsibilities:

- Store persistent data
- Enforce constraints
- Maintain relationships
- Ensure data integrity

Technology:

- SQL Server
- Entity Framework Core

---

# 10. Internal Services

The backend includes internal modules that are not directly exposed as APIs.

## Payment Gateway Simulator

Responsibilities:

- Validate card
- Check expiry
- Check balance
- Approve/Reject payment

---

## Fraud Detection Engine

Responsibilities:

- Evaluate fraud rules
- Create FraudLog
- Assign severity
- Notify administrators

---

## Notification Service

Responsibilities:

- Send OTP
- Send payment confirmation
- Send password reset emails
- Store notification history

SMTP Provider:

SMTP2GO

---

## PDF Service

Responsibilities:

- Generate transaction receipts
- Generate reports

Library:

QuestPDF

---

# 11. Authentication Architecture

```
User

↓

Login

↓

JWT Generated

↓

Access Token

↓

Protected APIs

↓

Refresh Token

↓

New Access Token
```

Authentication uses:

- JWT
- Refresh Tokens
- ASP.NET Core Identity

---

# 12. Authorization

Supported roles:

- Customer
- Merchant
- Admin

Each protected endpoint checks role permissions before execution.

---

# 13. Payment Processing Flow

```
Customer

↓

Payment Form

↓

PaymentController

↓

PaymentService

↓

Payment Gateway Simulator

↓

Card Validation

↓

Balance Verification

↓

Fraud Detection

↓

Transaction Repository

↓

SQL Server

↓

Notification Service

↓

Email

↓

API Response
```

---

# 14. Request Lifecycle

```
HTTP Request

↓

Middleware

↓

Authentication

↓

Authorization

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Controller

↓

HTTP Response
```

---

# 15. Dependency Injection Flow

```
Controller

↓

IPaymentService

↓

PaymentService

↓

IPaymentRepository

↓

PaymentRepository
```

Dependency Injection is managed using the built-in ASP.NET Core container.

---

# 16. AutoMapper Flow

```
Request DTO

↓

Entity

↓

Database

↓

Entity

↓

Response DTO
```

AutoMapper handles conversion between DTOs and entities.

---

# 17. Logging Architecture

Logging framework:

Serilog

Logged events include:

- Login
- Logout
- Payment
- Fraud
- Exceptions
- Email failures

Sensitive data such as passwords, CVVs, JWTs, and full card numbers must never be logged.

---

# 18. Error Handling

Global Exception Middleware handles unhandled exceptions.

Responsibilities:

- Log errors
- Return consistent error responses
- Prevent sensitive information leakage

---

# 19. Security Architecture

Security measures include:

- JWT Authentication
- Password hashing
- HTTPS
- Role-based authorization
- Input validation
- Soft delete
- Audit logging
- Refresh tokens
- Global exception handling

---

# 20. Design Patterns Used

| Pattern                | Purpose                            |
|------------------------|------------------------------------|
| Layered Architecture   | Separation of concerns             |
| Repository Pattern     | Data access abstraction            |
| Generic Repository     | Reusable CRUD operations           |
| Dependency Injection   | Loose coupling                     |
| DTO Pattern            | Safe API communication             |
| Singleton              | Configuration and logging          |
| Factory (framework)    | Service creation via DI            |

---

# 21. SOLID Principles

The system follows SOLID principles:

- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle

---

# 22. Scalability

The architecture supports future enhancements:

- Mobile applications
- Multiple payment methods
- Additional currencies
- Cloud deployment
- Microservices
- AI-based fraud detection
- Distributed caching

---

# 23. Deployment Overview

```
+------------------------+
|   React Frontend       |
|     (Vercel)           |
+-----------+------------+
            |
            | HTTPS
            |
+-----------v------------+
| ASP.NET Core API       |
| (Render / Azure / IIS) |
+-----------+------------+
            |
            |
+-----------v------------+
| SQL Server             |
| (Local / Azure SQL)    |
+------------------------+
```

---

# 24. Architecture Summary

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API (.NET 8)
- Architecture: Layered
- ORM: Entity Framework Core
- Database: SQL Server
- Authentication: JWT + Refresh Tokens
- Email: SMTP2GO
- PDF: QuestPDF
- Logging: Serilog
- API Style: REST
- Repository Pattern: Generic + Specialized
- Mapping: AutoMapper
- State Management: Zustand

---

# Version History

| Version     | Date         | Description                |
|-------------|--------------|----------------------------|
| 1.0         | 2026-08-05   | Initial system architecture|