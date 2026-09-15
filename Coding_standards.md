# CODING_STANDARDS.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# 1. Purpose

This document defines the coding standards for the Meridian Credit project.

All contributors and AI-generated code must follow these standards to ensure consistency, maintainability, readability, and scalability.

---

# 2. General Principles

Follow these principles throughout the project:

- Write clean and readable code.
- Prefer simplicity over cleverness.
- Follow the Single Responsibility Principle (SRP).
- Avoid duplicated code (DRY).
- Keep methods small and focused.
- Write self-explanatory code.
- Use meaningful names.
- Never hardcode configuration values.
- Favor composition over inheritance where appropriate.

---

# 3. Architecture Rules

The project follows Layered Architecture.

```
React UI
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity Framework Core
    ↓
SQL Server
```

Rules:

- Controllers never access the database directly.
- Controllers never contain business logic.
- Services contain business logic.
- Repositories contain only data access logic.
- DTOs are used for API communication.
- Entities are never returned directly to the client.

---

# 4. C# Coding Standards

## Naming

Classes

```csharp
PaymentService
CardRepository
TransactionController
```

Interfaces

```csharp
IPaymentService
ICardRepository
```

Methods

```csharp
ProcessPaymentAsync()
GetCustomerCardsAsync()
```

Properties

```csharp
FullName
AvailableBalance
CreatedAt
```

Private Fields

```csharp
_paymentRepository
_emailService
_logger
```

Constants

```csharp
public const int MaxOtpAttempts = 5;
```

Enums

```csharp
TransactionStatus
CardStatus
```

---

# 5. Asynchronous Programming

Always use asynchronous methods for I/O operations.

Preferred:

```csharp
Task<UserDto>
Task<IActionResult>
```

Avoid synchronous database calls.

Method names should end with:

```text
Async
```

Example:

```csharp
GetUserByIdAsync()
```

---

# 6. Dependency Injection

Always inject dependencies through constructors.

Do not instantiate services manually.

Correct:

```csharp
public PaymentService(
    IPaymentRepository paymentRepository,
    ILogger<PaymentService> logger)
```

Avoid:

```csharp
new PaymentRepository()
```

---

# 7. Entity Framework Core

Use:

- Code First
- Migrations
- Fluent API for relationships
- Data Annotations for validation

Never:

- Write raw SQL unless absolutely necessary.
- Disable tracking unless required.
- Expose DbContext outside repositories.

---

# 8. Repository Pattern

Every entity should have:

```
Interface
↓

Implementation
```

Example:

```
ICardRepository

↓

CardRepository
```

Repositories should not contain business rules.

---

# 9. Service Layer

Services are responsible for:

- Validation
- Business logic
- Fraud checks
- Payment processing
- Notifications

Each service should have an interface.

---

# 10. Controllers

Controllers should:

- Validate requests
- Call services
- Return standardized responses

Controllers should not:

- Query the database
- Contain business logic
- Perform calculations

---

# 11. DTO Guidelines

Separate DTOs into:

```
Requests/

Responses/
```

Never expose Entity Framework entities directly through the API.

---

# 12. Validation

Backend validation:

- Data Annotations
- FluentValidation (recommended for complex rules)

Frontend validation:

- React Hook Form
- Zod

Validation must exist on both frontend and backend.

---

# 13. Error Handling

Use Global Exception Middleware.

Return consistent error responses.

Do not expose:

- Stack traces
- SQL errors
- Internal implementation details

---

# 14. Logging

Use Serilog.

Log:

- Login attempts
- Payments
- Fraud detection
- Exceptions
- Email failures

Never log:

- Passwords
- JWTs
- CVVs
- Full card numbers

---

# 15. API Standards

Base URL

```
/api/v1/
```

Use REST conventions.

Examples:

```
GET
POST
PUT
PATCH
DELETE
```

Return correct HTTP status codes.

---

# 16. API Response Format

Success

```json
{
  "success": true,
  "message": "Operation Successful",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": []
}
```

---

# 17. React Standards

Use:

- Functional Components
- Hooks
- TypeScript
- React Router
- Zustand
- Axios

Avoid Class Components.

---

# 18. Component Structure

Preferred order:

1. Imports
2. Types
3. Hooks
4. State
5. Event Handlers
6. JSX
7. Export

---

# 19. Component Naming

Pages

```
DashboardPage.tsx
LoginPage.tsx
```

Components

```
PaymentCard.tsx
UserTable.tsx
```

Hooks

```
useAuth.ts
usePayment.ts
```

---

# 20. File Naming

React

```
PascalCase.tsx
```

Hooks

```
camelCase.ts
```

Utilities

```
camelCase.ts
```

---

# 21. Folder Naming

Use lowercase.

Examples

```
components
pages
hooks
services
utils
```

---

# 22. CSS Guidelines

Use Tailwind CSS.

Avoid:

- Inline styles
- Custom CSS unless necessary

Reuse utility classes.

---

# 23. Git Commit Convention

Format

```
type(scope): description
```

Examples

```
feat(auth): implement login

fix(payment): validate balance

docs(api): update payment endpoints

refactor(card): simplify repository

style(ui): improve dashboard spacing

test(auth): add login unit tests
```

---

# 24. Branch Naming

Feature

```
feature/payment-module
```

Bug Fix

```
bugfix/login-error
```

Documentation

```
docs/api-specification
```

Refactor

```
refactor/payment-service
```

---

# 25. Code Comments

Comment only when necessary.

Prefer self-explanatory code.

Avoid obvious comments.

Bad:

```csharp
// Increment i
i++;
```

Good:

```csharp
// Retry payment after temporary gateway failure
```

---

# 26. Security Guidelines

- Hash passwords with BCrypt.
- Use JWT authentication.
- Validate all user input.
- Protect against SQL Injection via EF Core.
- Use HTTPS.
- Never trust client-side validation alone.

---

# 27. Performance Guidelines

- Use pagination.
- Avoid N+1 queries.
- Select only required columns.
- Use async database operations.
- Cache static configuration if needed.

---

# 28. Testing Standards

Unit test:

- Services
- Validators
- Fraud logic

Integration test:

- Controllers
- API endpoints

Do not unit test Entity Framework internals.

---

# 29. Documentation

Every public class and method should include XML documentation where appropriate.

Example:

```csharp
/// <summary>
/// Processes a customer payment.
/// </summary>
```

---

# 30. AI Coding Rules

When using AI tools:

- Follow this document.
- Do not generate placeholder code.
- Do not skip validation.
- Keep architecture unchanged.
- Respect folder structure.
- Reuse existing services and components.
- Do not introduce unnecessary dependencies.

---

# Version History

| Version     | Date         | Description               |
|-------------|--------------|---------------------------|
| 1.0         | 2026-08-05   | Initial coding standards  |