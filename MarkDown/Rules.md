# PROJECT_RULES 

# Meridian Credit Project Development Rules

Version: 1.0

These rules define the coding standards, architecture, conventions, and development practices for the Meridian Credit Credit Card Processing System.

All generated code, documentation, APIs, database schemas, and UI components must follow these rules unless explicitly overridden.

---

# 1. Project Goal

Build a secure, modular, maintainable Credit Card Processing System Simulator.

The system must simulate the lifecycle of a credit card payment without integrating with real banking systems or payment gateways.

---

# 2. Technology Stack

## Frontend

- React 19
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
- C# 12
- Entity Framework Core 8 (Code First)
- SQL Server
- JWT Authentication
- ASP.NET Core Identity
- AutoMapper
- Serilog
- Swagger

---

# 3. Architecture

The application must follow Layered Architecture.

```
Client

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

Business logic must never bypass the service layer.

---

# 4. Backend Structure

Every module must follow this structure.

```
Controller
      │
      ▼
Service Interface
      │
      ▼
Service
      │
      ▼
Repository Interface
      │
      ▼
Repository
      │
      ▼
Database
```

---

# 5. Repository Pattern

Use Generic Repository wherever possible.

Create specialized repositories only when entity-specific queries are required.

Example:

- UserRepository
- PaymentRepository
- CardRepository
- MerchantRepository
- TransactionRepository

---

# 6. Dependency Injection

All services and repositories must be registered using Dependency Injection.

Never instantiate services manually.

Correct:

```
constructor(
    IUserService userService
)
```

Incorrect:

```
new UserService()
```

---

# 7. DTO Rules

Never expose Entity Framework entities through API responses.

Always use DTOs.

Example:

```
User

↓

UserResponseDto
```

Every request and response should have dedicated DTOs where appropriate.

---

# 8. AutoMapper

Use AutoMapper for mapping between Entities and DTOs.

Avoid manual mapping unless absolutely necessary.

---

# 9. Async Programming

All database operations must be asynchronous.

Use:

- async
- await

Never block threads using:

- .Result
- .Wait()

---

# 10. API Standards

RESTful API principles must be followed.

Examples:

GET

POST

PUT

PATCH

DELETE

Return proper HTTP status codes.

Examples:

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Server Error

---

# 11. Validation

Validate requests on both frontend and backend.

Frontend

- React Hook Form
- Zod

Backend

- Data Annotations
- FluentValidation (if required)

Never trust client-side validation.

---

# 12. Authentication

Authentication must use JWT.

Passwords must be hashed using BCrypt.

Role-based authorization must be implemented.

Roles:

- Customer
- Merchant
- Admin

---

# 13. Security

Never:

- store plain-text passwords
- store plain-text CVV
- expose secrets
- commit .env files

Always:

- validate inputs
- authorize endpoints
- sanitize user input

---

# 14. Error Handling

Use Global Exception Middleware.

Controllers should not contain try-catch blocks unless required.

Return standardized API responses.

---

# 15. Logging

Use Serilog.

Log:

- Errors
- Warnings
- Important Events

Never log passwords, JWTs, CVVs, or sensitive data.

---

# 16. Database Rules

Use Entity Framework Core Code First.

Use migrations.

Never edit migration history manually.

Every entity must have:

- Primary Key
- Relationships
- Constraints

---

# 17. Naming Conventions

Classes

PascalCase

Example:

```
PaymentService
```

Interfaces

Prefix with I

Example:

```
IPaymentService
```

Variables

camelCase

Example:

```
paymentAmount
```

Constants

UPPER_SNAKE_CASE or static readonly fields.

Database Tables

Singular names.

Example:

```
User

Card

Transaction
```

---

# 18. Controller Rules

Controllers should only:

- receive requests
- validate model state
- call services
- return responses

Business logic must never be written inside controllers.

---

# 19. Service Rules

Services contain business logic.

Services may call:

- repositories
- notification service
- fraud engine
- payment gateway simulator

Services must not access HTTP context directly unless necessary.

---

# 20. Repository Rules

Repositories only access the database.

No business logic.

No email sending.

No JWT generation.

---

# 21. Payment Gateway

The payment gateway is an internal simulator.

It must:

- validate card
- verify balance
- perform fraud checks
- approve or reject payment
- generate transaction ID

It must never connect to real payment providers.

---

# 22. Fraud Detection

Fraud detection is rule-based.

Rules include:

- High transaction amount
- Expired card
- Blocked card
- Insufficient balance
- Rapid repeated transactions

---

# 23. Email Service

SMTP2GO will be used.

Send:

- OTP
- Payment Confirmation
- Password Reset
- Alerts

Never send sensitive card information by email.

---

# 24. PDF Generation

QuestPDF should generate:

- Payment Receipt
- Transaction Report

---

# 25. Frontend Rules

Use functional components.

Use hooks.

No class components.

Use reusable UI components.

Keep pages thin.

Move API calls into service files.

---

# 26. State Management

Use Zustand.

Avoid excessive prop drilling.

---

# 27. API Communication

Use Axios.

Create one centralized API client.

Do not hardcode URLs.

---

# 28. Git Rules

Commit frequently.

Use meaningful commit messages.

Examples:

feat: implement payment processing

fix: validate card expiry

refactor: simplify transaction service

---

# 29. Documentation

Every major module should include:

- Purpose
- Responsibilities
- Dependencies

Public methods should include XML documentation where appropriate.

---

# 30. Project Scope

The application must remain a simulation.

Do NOT integrate:

- Stripe
- Razorpay
- PayPal
- Banking APIs
- Real Credit Cards

All transactions are simulated.

---

# Final Principle

Write code as if it will be maintained by another developer in the future.

Prioritize readability, modularity, maintainability, security, and consistency over clever or overly complex solutions.