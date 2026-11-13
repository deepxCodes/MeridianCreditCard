# BUSINESS_RULES.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# Business Rules

## Overview

This document defines the business rules governing the Meridian Credit Credit Card Processing System.

Business rules specify how the system behaves under different conditions and ensure that all payment processing, authentication, fraud detection, and user management follow consistent logic.

These rules are independent of implementation and must be enforced by the backend services.

---

# 1. User Management Rules

## BR-001

Every user must register using a unique email address.

---

## BR-002

Passwords must be securely hashed before being stored.

---

## BR-003

Users cannot log in until their email address has been verified.

---

## BR-004

Only administrators can create other administrator accounts.

---

## BR-005

A user may have only one account associated with a specific email address.

---

## BR-006

Soft-deleted users cannot log in.

---

## BR-007

Every successful login must create an Audit Log entry.

---

# 2. Merchant Rules

## BR-008

Only users with the Merchant role may own a MerchantProfile.

---

## BR-009

Each merchant can have only one MerchantProfile.

---

## BR-010

Merchants can receive payments but cannot initiate customer payments.

---

## BR-011

Merchants may only view transactions associated with their own business.

---

# 3. Card Rules

## BR-012

A customer may own multiple simulated credit cards.

---

## BR-013

Each card belongs to exactly one customer.

---

## BR-014

Only Active cards may be used for payments.

---

## BR-015

Blocked cards must immediately reject payment requests.

---

## BR-016

Expired cards must immediately reject payment requests.

---

## BR-017

Card balances cannot become negative.

---

## BR-018

CVV values must never be stored in the database.

---

## BR-019

Only masked card numbers may be displayed to users.

---

## BR-020

Soft-deleted cards cannot be used.

---

# 4. Payment Processing Rules

## BR-021

Every payment request must create a transaction record.

---

## BR-022

Each transaction must have a unique Transaction Reference Number.

---

## BR-023

Only INR currency is supported.

---

## BR-024

Payment amount must be greater than zero.

---

## BR-025

Payment processing must follow the sequence below.

```
Validate Customer

↓

Validate Card

↓

Validate Card Status

↓

Validate Expiry

↓

Validate Balance

↓

Fraud Detection

↓

Approve / Reject

↓

Update Balance

↓

Store Transaction

↓

Generate Receipt

↓

Send Notification
```

---

## BR-026

Approved payments reduce the available balance.

---

## BR-027

Declined or failed payments must never change the card balance.

---

## BR-028

Transactions are permanent and cannot be deleted.

---

## BR-029

Transaction history must remain immutable.

---

# 5. Fraud Detection Rules

## BR-030

Transactions greater than ₹50,000 must be flagged.

---

## BR-031

Payments attempted using blocked cards must generate a Fraud Log.

---

## BR-032

Payments attempted using expired cards must generate a Fraud Log.

---

## BR-033

Payments with insufficient balance must be rejected.

---

## BR-034

More than five payment attempts within one minute from the same card must be flagged.

---

## BR-035

Every flagged transaction creates at most one Fraud Log.

---

## BR-036

Only administrators may resolve fraud cases.

---

# 6. OTP Rules

## BR-037

OTP codes are generated only for:

- Registration
- Email Verification
- Password Reset

---

## BR-038

OTPs expire after five minutes.

---

## BR-039

An OTP may be used only once.

---

## BR-040

Expired OTPs cannot be reused.

---

# 7. Notification Rules

## BR-041

A notification must be generated after every payment attempt.

---

## BR-042

Successful payments generate payment confirmation emails.

---

## BR-043

Failed payments generate failure notifications.

---

## BR-044

Sensitive information must never be included in notifications.

Examples:

- Full card number
- Password
- CVV
- JWT

---

# 8. Audit Rules

## BR-045

Security-sensitive actions must generate Audit Logs.

Examples:

- Login
- Logout
- Password Reset
- Card Block
- User Block
- Payment Approval
- Payment Decline

---

## BR-046

Audit logs are append-only.

---

## BR-047

Audit logs cannot be edited.

---

## BR-048

Audit logs cannot be deleted.

---

# 9. Authentication Rules

## BR-049

JWT Authentication must protect secured APIs.

---

## BR-050

Role-Based Authorization must be enforced.

Supported roles:

- Customer
- Merchant
- Admin

---

## BR-051

Refresh Tokens may be revoked during logout.

---

## BR-052

Expired access tokens cannot access protected resources.

---

# 10. Administrator Rules

## BR-053

Administrators may block or unblock cards.

---

## BR-054

Administrators may view all users.

---

## BR-055

Administrators may view all merchants.

---

## BR-056

Administrators may view all transactions.

---

## BR-057

Administrators may view all Fraud Logs.

---

## BR-058

Administrators may generate system reports.

---

# 11. Reporting Rules

## BR-059

Transaction reports are generated dynamically.

---

## BR-060

Reports must use current database data.

---

## BR-061

Receipts must include:

- Transaction Reference
- Merchant Name
- Amount
- Date & Time
- Payment Status

---

# 12. Data Integrity Rules

## BR-062

Foreign key relationships must always remain valid.

---

## BR-063

Unique constraints must prevent duplicate email addresses.

---

## BR-064

Every transaction must reference a valid customer, merchant, and card.

---

## BR-065

Soft-deleted records are excluded from normal application queries.

---

# 13. Error Handling Rules

## BR-066

All validation errors return appropriate HTTP status codes.

---

## BR-067

Internal exceptions must be logged.

---

## BR-068

System errors must not expose implementation details to users.

---

# 14. Future Business Rules

The business layer should support future expansion without major redesign.

Future enhancements may include:

- Debit Cards
- UPI
- Wallet Payments
- Multiple Currencies
- AI Fraud Detection
- Mobile Applications 
- Scheduled Reports

---

# Business Rule Summary

| Module           | Rules |
|------------------|------:|
| User Management  | 7     |
| Merchant         | 4     |
| Card             | 9     |
| Payment          | 9     |
| Fraud Detection  | 7     |
| OTP              | 4     |
| Notification     | 4     |
| Audit            | 4     |
| Authentication   | 4     |
| Administrator    | 6     |
| Reporting        | 3     |
| Data Integrity   | 4     |
| Error Handling   | 3     |

**Total Business Rules:** 68