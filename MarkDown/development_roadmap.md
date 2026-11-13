# DEVELOPMENT_ROADMAP.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# 1. Overview

This roadmap defines the recommended implementation order for Meridian Credit.

The project will follow a **Backend-First** development strategy, where the database, API, and business logic are completed before building the frontend.

This approach ensures a stable backend foundation, simplifies frontend integration, and reduces rework.

---

# 2. Development Strategy

Development Order

```
Planning
      ↓
Database
      ↓
Backend
      ↓
Authentication
      ↓
Core Business Logic
      ↓
Frontend
      ↓
Testing
      ↓
Deployment
```

---

# 3. Project Phases

| Phase       | Name                    | Priority     |
|-------------|-------------------------|--------------|
| 1           | Project Setup           | Critical     |
| 2           | Database Development    | Critical     |
| 3           | Authentication          | Critical     |
| 4           | User Management         | High         |
| 5           | Card Management         | High         |
| 6           | Payment Processing      | Critical     |
| 7           | Fraud Detection         | High         |
| 8           | Notifications           | Medium       |
| 9           | Dashboard               | High         |
| 10          | Reports                 | Medium       |
| 11          | Testing                 | Critical     |
| 12          | Deployment              | Medium       |

---

# Phase 1 – Project Setup

## Objectives

- Create Git repository
- Initialize React project
- Initialize ASP.NET Core Web API
- Configure SQL Server
- Configure Entity Framework Core
- Configure GitHub repository
- Configure environment variables
- Configure project structure

### Deliverables

- Working solution
- Folder structure
- Documentation
- Initial commit

---

# Phase 2 – Database

## Objectives

Create all entities

- User
- MerchantProfile
- Card
- Transaction
- FraudLog
- OTP
- Notification
- AuditLog
- RefreshToken

### Tasks

- Create DbContext
- Create Entities
- Configure Relationships
- Add Fluent API
- Create Initial Migration
- Seed Admin Account

### Deliverables

- Working SQL Server Database

---

# Phase 3 – Authentication

## Objectives

Implement

- Registration
- Login
- JWT
- Refresh Token
- Email Verification
- Password Reset

### Tasks

- BCrypt
- JWT
- SMTP2GO
- Role Management
- Middleware

### Deliverables

Complete Authentication Module

---

# Phase 4 – User Management

## Customer

- View Profile
- Update Profile

Merchant

- Merchant Profile

Admin

- User Management

---

# Phase 5 – Card Management

Features

- Add Card
- Edit Card
- View Cards
- Block Card
- Unblock Card
- Delete Card (Soft Delete)

Validation

- Expiry
- Balance
- Status

---

# Phase 6 – Payment Processing

This is the core module.

Implementation Order

```
Card Validation

↓

Expiry Validation

↓

Balance Validation

↓

Fraud Detection

↓

Transaction Creation

↓

Balance Update

↓

Notification

↓

Receipt Generation
```

Deliverables

Complete Payment Gateway Simulator

---

# Phase 7 – Fraud Detection

Rules

- High Amount
- Blocked Card
- Expired Card
- Insufficient Balance
- Rapid Transactions

Create

FraudLog

Dashboard Widget

Admin Review

---

# Phase 8 – Notifications

Email Types

- OTP
- Payment Success
- Payment Failed
- Password Reset

Store

Notification History

---

# Phase 9 – Dashboards

Customer Dashboard

- Balance
- Cards
- Transactions
- Spending Chart

Merchant Dashboard

- Revenue
- Transactions
- Customers

Admin Dashboard

- Users
- Fraud
- Transactions
- Reports

---

# Phase 10 – Reports

Generate

- Daily
- Weekly
- Monthly

Export

PDF

---

# Phase 11 – Frontend

Pages

Authentication

Customer

Merchant

Admin

Responsive Design

Loading States

Error Pages

---

# Phase 12 – Testing

Unit Tests

- Services

Integration Tests

- Controllers

Manual Testing

- Complete Payment Flow

---

# Phase 13 – Deployment

Frontend

Vercel

Backend

Azure App Service (preferred) or Render

Database

SQL Server (local during development; Azure SQL for cloud deployment if required)

---

# Recommended Development Order

```
Project Setup
      ↓
Authentication
      ↓
Users
      ↓
Cards
      ↓
Transactions
      ↓
Payment Gateway
      ↓
Fraud Detection
      ↓
Notifications
      ↓
Dashboards
      ↓
Reports
      ↓
Testing
      ↓
Deployment
```

---

# Definition of Done (DoD)

A feature is considered complete only if:

- Business logic implemented
- Validation completed
- Database migration updated (if applicable)
- API endpoint implemented
- API tested
- Frontend integrated
- Error handling implemented
- Logging added
- Documentation updated

---

# Milestones

## Milestone 1

- Project Setup
- Database
- Authentication

---

## Milestone 2

- User Module
- Card Module

---

## Milestone 3

- Payment Engine

---

## Milestone 4

- Fraud Detection

---

## Milestone 5

- Dashboard

---

## Milestone 6

- Reports

---

## Milestone 7

- Testing

---

## Milestone 8

- Deployment

---

# Risk Management

| Risk                      | Mitigation                            |
|---------------------------|---------------------------------------|
| Database design changes   | Finalize schema before coding         |
| API changes               | Implement API specification first     |
| UI inconsistency          | Follow UI Guidelines                  |
| Security issues           | Follow Security Guidelines            |
| Scope creep               | Stick to documented requirements      |

---

# Final Submission Checklist

## Documentation

- README
- Requirements
- Architecture
- API Specification
- Database Schema
- Business Rules

## Backend

- Authentication
- Payment Engine
- Fraud Detection
- Notifications

## Frontend

- Responsive UI
- Dashboards
- Forms
- Validation

## Database

- Migrations
- Seed Data

## Testing

- Unit Tests
- Integration Tests
- Manual Testing

## Deployment

- Frontend deployed
- Backend deployed
- Database configured

---

# Success Criteria

The project is considered successful if it:

- Simulates the complete credit card payment workflow.
- Supports Customer, Merchant, and Admin roles.
- Implements secure authentication and authorization.
- Demonstrates layered architecture and clean coding practices.
- Produces accurate transaction records and reports.
- Is fully documented and deployable.

---

# Version History

| Version     | Date         | Description               |
|-------------|--------------|---------------------------|
| 1.0         | 2026-08-05   | Initial development roadmap |