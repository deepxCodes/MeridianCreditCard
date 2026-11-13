# DATABASE_SCHEMA.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# Database Schema Documentation

## Overview

Meridian Credit uses **Microsoft SQL Server** as its primary relational database and follows the **Entity Framework Core Code First** approach.

The database is designed following **Third Normal Form (3NF)** to eliminate redundancy, ensure data integrity, and support scalability.

The schema simulates a real-world credit card payment ecosystem while maintaining simplicity appropriate for an academic Software Engineering project.

---

# Database Design Principles

The database follows these principles:

- Third Normal Form (3NF)
- ACID Compliance
- Referential Integrity
- Soft Delete Support
- Audit Tracking
- Optimistic Concurrency
- Entity Framework Core Code First
- Integer Identity Primary Keys
- Foreign Key Constraints
- Indexed Frequently Queried Columns

---

# Database Engine

| Property             | Value                         |
|----------------------|-------------------------------|
| Database             | Microsoft SQL Server          |
| ORM                  | Entity Framework Core 8       |
| Approach             | Code First                    |
| Primary Key          | Integer Identity              |
| Soft Delete          | Enabled                       |
| Audit Fields         | Enabled                       |
| Concurrency          | RowVersion                    |
| Collation            | SQL Server Default            |

---

# Entity Overview

The database consists of the following entities:

| Entity          | Purpose                                      |
|-----------------|----------------------------------------------|
| User            | Stores all system users (Customer, Merchant, Admin) |
| MerchantProfile | Merchant-specific business information       |
| Card            | Stores simulated credit cards                |
| Transaction     | Stores all payment transactions              |
| FraudLog        | Stores suspicious transaction records        |
| OTP             | Stores email verification and password reset OTPs |
| Notification    | Stores notification history                  |
| AuditLog        | Stores system activity logs                  |

---

# BaseEntity

Every major entity inherits the following common fields.

| Column     | Data Type       | Description                     |
|------------|-----------------|---------------------------------|
| Id         | INT IDENTITY    | Primary Key                     |
| CreatedAt  | DATETIME2       | Record creation timestamp       |
| UpdatedAt  | DATETIME2       | Last modification timestamp     |
| CreatedBy  | NVARCHAR(100)   | User who created the record     |
| UpdatedBy  | NVARCHAR(100)   | Last user who modified the record|
| IsDeleted  | BIT             | Soft delete flag                |
| DeletedAt  | DATETIME2       | Soft delete timestamp           |
| RowVersion | ROWVERSION      | Optimistic concurrency token    |

---

# Enumerations

## UserRole

```text
Customer
Merchant
Admin
```

---

## CardStatus

```text
Active
Blocked
Expired
Inactive
```

---

## TransactionStatus

```text
Pending
Approved
Declined
Failed
Cancelled
```

---

## NotificationType

```text
OTP

PaymentSuccess

PaymentFailed

PasswordReset

General
```

---

## NotificationStatus

```text
Pending

Sent

Failed
```

---

## FraudSeverity

```text
Low

Medium

High

Critical
```

---

## OTPPurpose

```text
Registration

PasswordReset

EmailVerification
```

---

# Entity: User

## Description

Stores all authenticated users within the system.

Every person using Meridian Credit exists in this table.

User roles determine application permissions.

---

## Columns

| Column         | Type            | Constraints            | Description                  |
|----------------|-----------------|------------------------|------------------------------|
| Id             | INT             | PK Identity            | User ID                      |
| FullName       | NVARCHAR(150)   | NOT NULL               | Full name                    |
| Email          | NVARCHAR(150)   | UNIQUE NOT NULL        | Login email                  |
| PasswordHash   | NVARCHAR(MAX)   | NOT NULL               | BCrypt hashed password       |
| PhoneNumber    | NVARCHAR(20)    | NULL                   | Contact number               |
| Role           | NVARCHAR(20)    | NOT NULL               | Customer, Merchant, Admin    |
| IsEmailVerified| BIT             | Default False          | Email verification status    |
| LastLoginAt    | DATETIME2       | NULL                   | Last login timestamp         |
| CreatedAt      | DATETIME2       | NOT NULL               | Created time                 |
| UpdatedAt      | DATETIME2       | NOT NULL               | Updated time                 |
| CreatedBy      | NVARCHAR(100)   | NULL                   | Audit                        |
| UpdatedBy      | NVARCHAR(100)   | NULL                   | Audit                        |
| IsDeleted      | BIT             | Default False          | Soft delete                  |
| DeletedAt      | DATETIME2       | NULL                   | Soft delete time             |
| RowVersion     | ROWVERSION      | Required               | Concurrency                  |

---

## Relationships

One User

↓

Many Cards

One User

↓

Many Transactions

One User

↓

Many Notifications

One User

↓

Many OTPs

One User

↓

Many Audit Logs

One Merchant User

↓

One Merchant Profile

---

## Indexes

- PK_User_Id
- UQ_User_Email
- IX_User_Role
- IX_User_IsDeleted

---

## Business Rules

- Email must be unique.
- Passwords must never be stored in plain text.
- Email verification required before login.
- Admin accounts cannot be self-registered.
- Users are soft deleted.
- Deleted users cannot log in.

---

# Entity: MerchantProfile

## Description

Contains additional business information for users whose role is Merchant.

Only merchant users will have a corresponding MerchantProfile record.

---

## Columns
| Column           | Type            | Constraints   | Description               |
|------------------|-----------------|---------------|---------------------------|
| Id               | INT             | PK Identity   | Merchant Profile ID       |
| UserId           | INT             | FK User       | Merchant User             |
| BusinessName     | NVARCHAR(200)   | NOT NULL      | Business name             |
| BusinessCategory | NVARCHAR(100)   | NOT NULL      | Business category         |
| BusinessAddress  | NVARCHAR(300)   | NULL          | Business address          |
| GSTNumber        | NVARCHAR(30)    | NULL          | GST (optional)            |
| Website          | NVARCHAR(200)   | NULL          | Merchant website          |
| CreatedAt        | DATETIME2       | NOT NULL      | Audit                     |
| UpdatedAt        | DATETIME2       | NOT NULL      | Audit                     |
| CreatedBy        | NVARCHAR(100)   | NULL          | Audit                     |
| UpdatedBy        | NVARCHAR(100)   | NULL          | Audit                     |
| IsDeleted        | BIT             | Default False | Soft delete               |
| DeletedAt        | DATETIME2       | NULL          | Soft delete               |
| RowVersion       | ROWVERSION      | Required      | Concurrency               |

---

## Relationships

MerchantProfile

↓

Belongs To

↓

One User

---

## Indexes

- PK_MerchantProfile_Id
- FK_UserId
- IX_BusinessName

---

## Business Rules

- Only Merchant users can own MerchantProfile.
- One User can have only one MerchantProfile.
- MerchantProfile uses soft delete.

---

# Entity: Card

## Description

Stores all simulated credit cards belonging to customers.

This table does **not** store real card data.

---

## Columns

| Column               | Type            | Constraints   | Description                                  |
|----------------------|-----------------|---------------|----------------------------------------------|
| Id                   | INT             | PK Identity   | Card ID                                      |
| UserId               | INT             | FK User       | Card Owner                                   |
| CardHolderName       | NVARCHAR(150)   | NOT NULL      | Printed card name                            |
| MaskedCardNumber     | NVARCHAR(25)    | NOT NULL      | Example: 4111********1234                    |
| LastFourDigits       | NVARCHAR(4)     | NOT NULL      | Last four digits                             |
| ExpiryMonth          | TINYINT         | NOT NULL      | 1–12                                         |
| ExpiryYear           | SMALLINT        | NOT NULL      | YYYY                                         |
| AvailableBalance     | DECIMAL(18,2)   | NOT NULL      | Simulated balance                            |
| CardStatus           | NVARCHAR(20)    | NOT NULL      | Enum                                         |
| CreatedAt            | DATETIME2       | NOT NULL      | Audit                                        |
| UpdatedAt            | DATETIME2       | NOT NULL      | Audit                                        |
| CreatedBy            | NVARCHAR(100)   | NULL          | Audit                                        |
| UpdatedBy            | NVARCHAR(100)   | NULL          | Audit                                        |
| IsDeleted            | BIT             | Default False | Soft delete                                  |
| DeletedAt            | DATETIME2       | NULL          | Soft delete                                  |
| RowVersion           | ROWVERSION      | Required      | Concurrency                                  |

---

## Relationships

One User

↓

Many Cards

One Card

↓

Many Transactions

---

## Indexes

- PK_Card_Id
- FK_UserId
- IX_LastFourDigits
- IX_CardStatus
- IX_IsDeleted

---

## Business Rules

- A user can own multiple cards.
- Masked card number must never expose the complete number.
- CVV is never stored.
- Expired cards cannot process payments.
- Blocked cards cannot process payments.
- Balance cannot become negative.
- Soft delete is enabled.
---

# Entity: Transaction

## Description

Stores every simulated credit card payment processed by the system.

A transaction record is created regardless of whether the payment is approved or declined, ensuring a complete audit trail.

---

## Columns

| Column               | Type         | Constraints                | Description                                   |
|----------------------|--------------|----------------------------|-----------------------------------------------|
| Id                   | INT          | PK Identity                | Transaction ID                                |
| TransactionReference | NVARCHAR(30) | UNIQUE NOT NULL            | Example: TXN202608060001                      |
| CardId               | INT          | FK Card NOT NULL           | Card used for payment                         |
| CustomerId           | INT          | FK User NOT NULL           | Customer making the payment                   |
| MerchantId           | INT          | FK MerchantProfile NOT NULL| Merchant receiving payment                    |
| Amount               | DECIMAL(18,2)| NOT NULL                   | Payment amount (INR)                          |
| Currency             | CHAR(3)      | Default 'INR'              | Currency code                                 |
| TransactionStatus    | NVARCHAR(20) | NOT NULL                   | Pending, Approved, Declined, Failed, Cancelled|
| GatewayResponse      | NVARCHAR(30) | NOT NULL                   | Approved, Declined, Timeout, Error            |
| FailureReason        | NVARCHAR(250)| NULL                       | Reason for declined/failed transactions       |
| ProcessedAt          | DATETIME2    | NOT NULL                   | Transaction completion time                   |
| CreatedAt            | DATETIME2    | NOT NULL                   | Record creation time                          |
| UpdatedAt            | DATETIME2    | NOT NULL                   | Last update time                              |
| CreatedBy            | NVARCHAR(100)| NULL                       | Audit                                         |
| UpdatedBy            | NVARCHAR(100)| NULL                       | Audit                                         |
| RowVersion           | ROWVERSION   | Required                   | Optimistic concurrency                        |

---

## Relationships

One Customer

↓

Many Transactions

One Merchant

↓

Many Transactions

One Card

↓

Many Transactions

One Transaction

↓

Zero or One FraudLog

---

## Indexes

- PK_Transaction_Id
- UQ_Transaction_Reference
- IX_CustomerId
- IX_MerchantId
- IX_CardId
- IX_TransactionStatus
- IX_ProcessedAt
- IX_Amount

---

## Business Rules

- Every payment attempt creates a transaction.
- TransactionReference must be unique.
- Amount must be greater than zero.
- Currency is fixed as INR.
- Approved transactions deduct available balance.
- Declined and failed transactions never update balance.
- Transactions are immutable and are never deleted.

---

# Entity: FraudLog

## Description

Stores information about transactions flagged by the Fraud Detection Engine.

A transaction may generate zero or one fraud log depending on the fraud evaluation.

---

## Columns

| Column        | Type         | Constraints     | Description         |
|---------------|--------------|-----------------|---------------------|
| Id            | INT          | PK Identity     | Fraud Log ID        |
| TransactionId | INT          | FK Transaction NOT NULL | Related transaction |
| FraudReason   | NVARCHAR(250)| NOT NULL        | Reason for flagging |
| Severity      | NVARCHAR(20) | NOT NULL        | Low, Medium, High, Critical |
| IsResolved    | BIT          | Default False   | Resolution status   |
| ResolvedBy    | NVARCHAR(100)| NULL            | Administrator       |
| ResolvedAt    | DATETIME2    | NULL            | Resolution time     |
| CreatedAt     | DATETIME2    | NOT NULL        | Record creation     |
| UpdatedAt     | DATETIME2    | NOT NULL        | Record update       |
| CreatedBy     | NVARCHAR(100)| NULL            | Audit               |
| UpdatedBy     | NVARCHAR(100)| NULL            | Audit               |
| RowVersion    | ROWVERSION   | Required        | Concurrency         |

---

## Fraud Rules

Examples include:

- Amount greater than ₹50,000
- Blocked card
- Expired card
- Insufficient balance
- More than 5 transactions within one minute
- Repeated failed payment attempts

---

## Indexes

- PK_FraudLog_Id
- IX_TransactionId
- IX_Severity
- IX_IsResolved

---

## Business Rules

- Fraud logs are never deleted.
- One transaction can have at most one fraud log.
- Only administrators can mark a fraud case as resolved.

---

# Entity: OTP

## Description

Stores One-Time Passwords used for account verification and password reset.

---

## Columns

| Column     | Type         | Constraints                | Description     |
|------------|--------------|----------------------------|-----------------|
| Id         | INT          | PK Identity                | OTP ID          |
| UserId     | INT          | FK User NOT NULL           | Owner of OTP    |
| OTPCode    | NVARCHAR(10) | NOT NULL                   | Generated OTP   |
| Purpose    | NVARCHAR(30) | NOT NULL                   | Registration, PasswordReset, EmailVerification |
| ExpiresAt  | DATETIME2    | NOT NULL                   | Expiration time |
| IsUsed     | BIT          | Default False              | Usage flag      |
| UsedAt     | DATETIME2    | NULL                       | Time of use     |
| CreatedAt  | DATETIME2    | NOT NULL                   | Generated time  |
| UpdatedAt  | DATETIME2    | NOT NULL                   | Last update     |
| CreatedBy  | NVARCHAR(100)| NULL                       | Audit           |
| UpdatedBy  | NVARCHAR(100)| NULL                       | Audit           |
| RowVersion | ROWVERSION   | Required                   | Concurrency     |

---

## Indexes

- PK_OTP_Id
- IX_UserId
- IX_ExpiresAt
- IX_IsUsed

---

## Business Rules

- OTP expires after a configurable duration (recommended: 5 minutes).
- OTP can only be used once.
- Expired OTPs cannot be reused.
- OTP history is retained for auditing and troubleshooting.

---

# Entity: Notification

## Description

Stores notifications sent by the system to users.

Notifications include both email and in-app messages.

---

## Columns

| Column            | Type          | Constraints        | Description          |
|-------------------|---------------|--------------------|----------------------|
| Id                | INT           | PK Identity        | Notification ID      |
| UserId            | INT           | FK User NOT NULL   | Recipient            |
| NotificationType  | NVARCHAR(30)  | NOT NULL           | OTP, PaymentSuccess, PaymentFailed, PasswordReset, General |
| Subject           | NVARCHAR(200) | NOT NULL           | Email subject/title  |
| Message           | NVARCHAR(MAX) | NOT NULL           | Notification content |
| Status            | NVARCHAR(20)  | NOT NULL           | Pending, Sent, Failed|
| SentAt            | DATETIME2     | NULL               | Delivery time        |
| CreatedAt         | DATETIME2     | NOT NULL           | Record creation      |
| UpdatedAt         | DATETIME2     | NOT NULL           | Record update        |
| CreatedBy         | NVARCHAR(100) | NULL               | Audit                |
| UpdatedBy         | NVARCHAR(100) | NULL               | Audit                |
| RowVersion        | ROWVERSION    | Required           | Concurrency          |

---

## Indexes

- PK_Notification_Id
- IX_UserId
- IX_Status
- IX_NotificationType

---

## Business Rules

- Notifications are never deleted.
- Failed notifications can be retried.
- Sensitive information (passwords, CVV, full card numbers) must never be included.

---

# Entity: AuditLog

## Description

Stores important user and administrator activities performed within the system.

This table provides traceability and accountability.

---

## Columns

| Column         | Type         | Constraints     | Description                 |
|----------------|--------------|-----------------|-----------------------------|
| Id             | INT          | PK Identity     | Audit Log ID                |
| UserId         | INT          | FK User NULL    | User performing the action  |
| Action         | NVARCHAR(100)| NOT NULL        | Action performed            |
| EntityName     | NVARCHAR(100)| NOT NULL        | Affected entity             |
| EntityId       | INT          | NULL            | Related record ID           |
| Description    | NVARCHAR(MAX)| NULL            | Additional details          |
| IPAddress      | NVARCHAR(50) | NULL            | Client IP                   |
| UserAgent      | NVARCHAR(500)| NULL            | Browser/device info         |
| CreatedAt      | DATETIME2    | NOT NULL        | Action timestamp            |
| RowVersion     | ROWVERSION   | Required        | Concurrency                 |

---

## Example Actions

- User Login
- User Logout
- Card Added
- Card Blocked
- Payment Initiated
- Payment Approved
- Payment Declined
- Merchant Registered
- Password Reset
- Admin Blocked User
- Admin Unblocked Card

---

## Indexes

- PK_AuditLog_Id
- IX_UserId
- IX_Action
- IX_CreatedAt

---

## Business Rules

- Audit logs are append-only.
- Existing audit records must never be modified.
- Audit logs must never be deleted.
- Every security-sensitive action should create an audit log entry.

---

---

# Entity: RefreshToken

## Description

Stores refresh tokens issued after successful authentication.

Refresh tokens allow users to obtain a new JWT access token without logging in again.

---

## Columns

| Column     | Type         | Constraints                | Description             |
|------------|--------------|----------------------------|-------------------------|
| Id         | INT          | PK Identity                | Refresh Token ID        |
| UserId     | INT          | FK User NOT NULL           | Token owner             |
| Token      | NVARCHAR(500)| UNIQUE NOT NULL            | Refresh token           |
| ExpiresAt  | DATETIME2    | NOT NULL                   | Expiration time         |
| RevokedAt  | DATETIME2    | NULL                       | Revocation timestamp    |
| IsRevoked  | BIT          | Default False              | Revocation status       |
| CreatedAt  | DATETIME2    | NOT NULL                   | Creation timestamp      |
| UpdatedAt  | DATETIME2    | NOT NULL                   | Last update             |
| CreatedBy  | NVARCHAR(100)| NULL                       | Audit                   |
| UpdatedBy  | NVARCHAR(100)| NULL                       | Audit                   |
| RowVersion | ROWVERSION   | Required                   | Optimistic concurrency  |

---

## Relationships

One User

↓

Many Refresh Tokens

---

## Indexes

- PK_RefreshToken_Id
- UQ_RefreshToken_Token
- IX_UserId
- IX_ExpiresAt
- IX_IsRevoked

---

## Business Rules

- A refresh token belongs to exactly one user.
- Refresh tokens expire after a configurable duration.
- Revoked tokens cannot be reused.
- Expired tokens must not issue new JWTs.

---

# Entity Relationships

```
User (1)
│
├───────────────< Card (Many)
│
├───────────────< Transaction (Many)
│
├───────────────< Notification (Many)
│
├───────────────< OTP (Many)
│
├───────────────< AuditLog (Many)
│
├───────────────< RefreshToken (Many)
│
└─────────────── MerchantProfile (1)

Card (1)
│
└───────────────< Transaction (Many)

MerchantProfile (1)
│
└───────────────< Transaction (Many)

Transaction (1)
│
└─────────────── FraudLog (0..1)
```

---

# Foreign Key Summary

| Child Table       | Parent Table    | Relationship           |
|-------------------|-----------------|------------------------|
| Card              | User            | Many-to-One            |
| MerchantProfile   | User            | One-to-One             |
| Transaction       | User (Customer) | Many-to-One            |
| Transaction       | MerchantProfile | Many-to-One            |
| Transaction       | Card            | Many-to-One            |
| FraudLog          | Transaction     | One-to-One (Optional)  |
| OTP               | User            | Many-to-One            |
| Notification      | User            | Many-to-One            |
| AuditLog          | User            | Many-to-One            |
| RefreshToken      | User            | Many-to-One            |

---

# Delete Strategy

## Soft Delete

Enabled for:

- User
- MerchantProfile
- Card

Fields:

- IsDeleted
- DeletedAt

---

## Permanent Records

The following tables are append-only and must never be deleted:

- Transaction
- FraudLog
- AuditLog
- Notification
- OTP
- RefreshToken

---

# Recommended Constraints

## User

- Email must be unique.
- Email is required.
- PasswordHash is required.

---

## Card

- AvailableBalance >= 0
- ExpiryMonth between 1 and 12
- ExpiryYear >= Current Year (application validation)
- LastFourDigits must contain exactly four digits.

---

## Transaction

- Amount > 0
- TransactionReference must be unique.
- Currency = INR

---

## OTP

- OTPCode required.
- ExpiresAt required.

---

## MerchantProfile

- One profile per merchant.
- BusinessName required.

---

# Recommended Indexes

## User

- Email (Unique)
- Role
- IsDeleted

---

## Card

- UserId
- CardStatus
- LastFourDigits

---

## Transaction

- CustomerId
- MerchantId
- CardId
- TransactionStatus
- TransactionReference
- ProcessedAt

---

## FraudLog

- TransactionId
- Severity

---

## OTP

- UserId
- ExpiresAt

---

## Notification

- UserId
- Status

---

## AuditLog

- UserId
- CreatedAt

---

## RefreshToken

- UserId
- Token
- ExpiresAt

---

# Normalization

The database follows Third Normal Form (3NF).

## First Normal Form (1NF)

- Atomic column values.
- No repeating groups.

---

## Second Normal Form (2NF)

- Every non-key attribute depends on the entire primary key.

---

## Third Normal Form (3NF)

- No transitive dependencies.
- Business information is stored only once.
- Merchant-specific data is isolated in MerchantProfile.
- Fraud information is isolated in FraudLog.

---

# Entity Framework Core Guidelines

- Code First approach.
- Fluent API for complex relationships.
- Data Annotations for simple validation.
- Use Migrations for schema evolution.
- Configure DeleteBehavior.Restrict where appropriate.
- Implement optimistic concurrency using RowVersion.
- Apply global query filters for soft-deleted entities.

---

# Naming Conventions

## Tables

Use singular names.

Examples:

- User
- Card
- Transaction

---

## Primary Keys

```
Id
```

---

## Foreign Keys

```
UserId

CardId

TransactionId

MerchantId
```

---

## Date Columns

Use:

- CreatedAt
- UpdatedAt
- DeletedAt
- ProcessedAt
- SentAt
- ExpiresAt

---

## Boolean Columns

Prefix with:

- Is
- Has

Examples:

- IsDeleted
- IsUsed
- IsEmailVerified
- IsRevoked
- IsResolved

---

# Migration Strategy

All database schema changes must be managed using Entity Framework Core migrations.

Never edit migration files after they have been applied.

Every structural change should generate a new migration with a descriptive name.

Examples:

```
InitialCreate

AddFraudLog

AddRefreshToken

AddNotificationTable
```

---

# Backup Strategy

For development:

- Backup before major schema changes.
- Export database before release milestones.

For production (future enhancement):

- Daily automated backups.
- Point-in-time recovery.

---

# Future Enhancements

The schema has been designed to support future expansion, including:

- Debit Card support
- Multiple currencies
- UPI simulation
- Wallet payments
- AI-based fraud detection
- Multi-factor authentication
- Scheduled reports
- Multi-tenant merchant support
- Mobile application integration
- Microservices migration

---

# Database Summary

| Entity            | Purpose                           |
|-------------------|-----------------------------------|
| User              | Stores all authenticated users    |
| MerchantProfile   | Merchant business details         |
| Card              | Simulated credit cards            |
| Transaction       | Payment records                   |
| FraudLog          | Fraud detection records           |
| OTP               | Verification and password reset   |
| Notification      | Email and in-app notifications    |
| AuditLog          | System activity history           |
| RefreshToken      | JWT session management            |

---

# Version History

| Version | Date         | Changes                           |
|---------|--------------|-----------------------------------|
| 1.0     | 2026-08-05   | Initial database schema completed |

---
