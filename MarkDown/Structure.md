# FOLDER_STRUCTURE.md

# Meridian Credit Project Folder Structure

Version: 1.0

This document defines the official folder structure for the Meridian Credit Credit Card Processing System.

Every file in the project must follow this structure.

---

# Project Root

```
Meridian Credit/
│
├── client/                    # React Frontend
├── server/                    # ASP.NET Core Web API
├── docs/                      # Project Documentation
├── database/                  # Database Scripts (Optional)
│
├── .gitignore
├── README.md
├── TECH_STACK.md
├── PROJECT_RULES.md
├── PROJECT_OVERVIEW.md
├── REQUIREMENTS.md
├── DO_AND_DONT.md
├── FOLDER_STRUCTURE.md
│
└── LICENSE
```

---

# Frontend Structure

```
client/
│
├── public/
│
├── src/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── components/
│   ├── common/
│   ├── forms/
│   ├── layout/
│   ├── dashboard/
│   ├── cards/
│   ├── tables/
│   ├── charts/
│   ├── dialogs/
│   └── ui/
│
├── pages/
│   ├── auth/
│   ├── customer/
│   ├── merchant/
│   ├── admin/
│   ├── payment/
│   ├── transactions/
│   ├── profile/
│   ├── reports/
│   └── errors/
│
├── layouts/
│
├── routes/
│
├── hooks/
│
├── services/
│   ├── api/
│   ├── auth/
│   ├── payment/
│   ├── card/
│   ├── merchant/
│   ├── admin/
│   └── notification/
│
├── store/
│
├── context/
│
├── schemas/
│
├── types/
│
├── constants/
│
├── utils/
│
├── lib/
│
├── styles/
│
├── App.tsx
│
└── main.tsx
```

---

# Backend Structure

```
server/
│
├── MeridianCredit.API.sln
│
├── src/
│
├── Controllers/
│
├── Services/
│   ├── Interfaces/
│   └── Implementations/
│
├── Repositories/
│   ├── Interfaces/
│   └── Implementations/
│
├── Models/
│   ├── Entities/
│   ├── DTOs/
│   ├── Requests/
│   └── Responses/
│
├── Data/
│   ├── Context/
│   ├── Configurations/
│   ├── Migrations/
│   └── Seed/
│
├── Middleware/
│
├── Validators/
│
├── Mapping/
│
├── Authentication/
│
├── Authorization/
│
├── Helpers/
│
├── Extensions/
│
├── Constants/
│
├── Enums/
│
├── Exceptions/
│
├── Logging/
│
├── Configuration/
│
├── ServicesInternal/
│   ├── PaymentGateway/
│   ├── FraudDetection/
│   ├── Notification/
│   └── Pdf/
│
├── Program.cs
│
├── appsettings.json
│
├── appsettings.Development.json
│
└── appsettings.Production.json
```

---

# Documentation Folder

```
docs/
│
├── README.md
├── PROJECT_OVERVIEW.md
├── REQUIREMENTS.md
├── TECH_STACK.md
├── PROJECT_RULES.md
├── DO_AND_DONT.md
├── FOLDER_STRUCTURE.md
├── SYSTEM_ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_SPECIFICATION.md
├── BUSINESS_RULES.md
├── CODING_STANDARDS.md
├── UI_GUIDELINES.md
├── DEVELOPMENT_ROADMAP.md
├── SECURITY_GUIDELINES.md
├── TESTING_STRATEGY.md
└── PROMPTS.md
```

---

# Frontend Module Organization

Each feature should be organized logically.

Example:

```
pages/customer/

Dashboard.tsx

Profile.tsx

Cards.tsx

Payments.tsx

Transactions.tsx
```

---

# Backend Module Organization

Example:

```
Controllers/

AuthController

CustomerController

MerchantController

PaymentController

CardController

TransactionController

AdminController
```

---

# Service Layer

Each controller should have one corresponding service.

Example:

```
IPaymentService

↓

PaymentService
```

---

# Repository Layer

Each entity should have one repository.

Example:

```
ICardRepository

↓

CardRepository
```

Generic CRUD operations should inherit from GenericRepository.

---

# DTO Organization

Separate request and response models.

```
Requests/

LoginRequest

PaymentRequest

AddCardRequest
```

```
Responses/

LoginResponse

PaymentResponse

TransactionResponse
```

---

# Internal Services

These are not exposed directly through APIs.

They are called only by the Service layer.

Modules include:

- Payment Gateway Simulator
- Fraud Detection Engine
- Email Notification Service
- PDF Generator

---

# Configuration Files

Use configuration files for:

- JWT
- SMTP2GO
- Database Connection
- Logging
- CORS
- Application Settings

Never hardcode configuration values.

---

# Static Assets

Store only frontend resources here.

Examples:

- Logos
- Icons
- Images
- Illustrations

---

# Naming Rules

Folders:

PascalCase where appropriate for backend.

Example:

```
Controllers
Repositories
Services
```

Frontend folders:

camelCase.

Example:

```
components
pages
services
utils
```

---

# General Rules

- Keep controllers thin.
- Business logic belongs in services.
- Database access belongs in repositories.
- Use DTOs for all API communication.
- Keep reusable components inside the components folder.
- Avoid circular dependencies.
- Maintain a single responsibility for every folder and class.

---

# Future Scalability

The folder structure is designed to support future enhancements, including:

- Mobile application APIs
- Additional payment methods
- Cloud deployment
- Third-party integrations
- Microservice migration (if required)

Without major restructuring.