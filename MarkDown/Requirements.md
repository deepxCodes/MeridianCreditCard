# Requirements Specification

## Project Title

**Meridian Credit – Credit Card Processing System**

---

# 1. Introduction

This document defines the functional and non-functional requirements for the Meridian Credit Credit Card Processing System.

Meridian Credit is a web-based application that simulates the processing of credit card transactions between customers, merchants, and a payment gateway without involving any real financial institutions.

The purpose of this document is to provide a complete set of requirements that guide the design, development, testing, and deployment of the system.

---

# 2. Functional Requirements

## 2.1 Authentication Module

### FR-001

The system shall allow users to register as a Customer or Merchant.

### FR-002

The system shall allow registered users to log in using their email and password.

### FR-003

The system shall verify user credentials before granting access.

### FR-004

The system shall hash passwords before storing them in the database.

### FR-005

The system shall authenticate users using JWT.

### FR-006

The system shall support role-based authorization.

### FR-007

The system shall allow users to log out securely.

### FR-008

The system shall allow users to reset forgotten passwords through email verification.

---

## 2.2 Customer Module

### FR-009

Customers shall be able to view and update their profile.

### FR-010

Customers shall be able to add simulated credit cards.

### FR-011

Customers shall be able to edit card information.

### FR-012

Customers shall be able to deactivate their own cards.

### FR-013

Customers shall be able to view available balance.

### FR-014

Customers shall be able to make payments.

### FR-015

Customers shall be able to view payment history.

### FR-016

Customers shall be able to search previous transactions.

### FR-017

Customers shall be able to download transaction receipts.

---

## 2.3 Merchant Module

### FR-018

Merchants shall be able to register and log in.

### FR-019

Merchants shall be able to receive simulated payments.

### FR-020

Merchants shall view received payments.

### FR-021

Merchants shall search payment history.

### FR-022

Merchants shall access a sales dashboard.

---

## 2.4 Card Management

### FR-023

The system shall validate card numbers.

### FR-024

The system shall validate CVV.

### FR-025

The system shall validate expiry dates.

### FR-026

The system shall mask card numbers while displaying them.

### FR-027

The system shall prevent the use of blocked cards.

### FR-028

The system shall prevent the use of expired cards.

---

## 2.5 Payment Module

### FR-029

The system shall allow customers to initiate a payment.

### FR-030

The system shall verify card validity.

### FR-031

The system shall verify sufficient available balance.

### FR-032

The system shall perform fraud detection before processing payments.

### FR-033

The system shall approve valid transactions.

### FR-034

The system shall reject invalid transactions.

### FR-035

The system shall update card balance after successful payment.

### FR-036

The system shall record every transaction.

### FR-037

The system shall generate a transaction reference number.

### FR-038

The system shall generate a payment receipt.

---

## 2.6 Fraud Detection

### FR-039

The system shall flag transactions greater than ₹50,000.

### FR-040

The system shall detect expired cards.

### FR-041

The system shall detect blocked cards.

### FR-042

The system shall detect insufficient balance.

### FR-043

The system shall detect multiple rapid transactions.

### FR-044

The system shall log suspicious transactions.

---

## 2.7 Notification Module

### FR-045

The system shall send OTP emails during account verification.

### FR-046

The system shall send payment confirmation emails.

### FR-047

The system shall send password reset emails.

### FR-048

The system shall display in-app notifications.

---

## 2.8 Admin Module

### FR-049

The administrator shall view all registered users.

### FR-050

The administrator shall view all merchants.

### FR-051

The administrator shall view all cards.

### FR-052

The administrator shall view all transactions.

### FR-053

The administrator shall block or unblock cards.

### FR-054

The administrator shall monitor suspicious transactions.

### FR-055

The administrator shall generate reports.

### FR-056

The administrator shall access dashboard analytics.

---

## 2.9 Reporting Module

### FR-057

The system shall generate PDF transaction receipts.

### FR-058

The system shall generate payment reports.

### FR-059

The system shall generate fraud reports.

### FR-060

The system shall generate customer activity reports.

---

# 3. Non-Functional Requirements

## Performance

- The system should respond within 2 seconds under normal usage.
- Payment simulation should complete within 5 seconds.
- Dashboard pages should load within 3 seconds.

---

## Security

- Passwords shall be hashed.
- JWT authentication shall be implemented.
- Sensitive routes shall require authorization.
- User input shall be validated.
- SQL Injection attacks shall be prevented.
- HTTPS shall be used in production.

---

## Reliability

- Transactions shall be stored reliably.
- Failed transactions shall not update balances.
- Error logs shall be maintained.

---

## Availability

- The application should be available whenever the server is running.
- Database backups should be supported.

---

## Scalability

The architecture should support future expansion including:

- Multiple merchants
- Additional payment methods
- Mobile applications
- Cloud deployment

---

## Maintainability

- Modular architecture
- Clean code
- Proper documentation
- Layer separation

---

## Usability

- Responsive design
- Simple navigation
- Accessible forms
- Clear error messages
- User-friendly dashboards

---

# 4. Business Requirements

- Simulate a complete credit card payment process.
- Maintain transaction history.
- Ensure secure authentication.
- Simulate fraud detection.
- Generate reports.
- Send email notifications.
- Support multiple user roles.

---

# 5. User Requirements

## Customer

- Register
- Login
- Manage cards
- Make payments
- View balance
- View transactions
- Download receipts

---

## Merchant

- Login
- Receive payments
- View payment history
- Access sales dashboard

---

## Administrator

- Manage users
- Manage merchants
- Manage cards
- View reports
- Monitor fraud
- Access analytics

---

# 6. System Requirements

## Hardware

### Development

- Intel Core i5 (or equivalent) or higher
- 8 GB RAM (Minimum)
- 16 GB RAM (Recommended)
- SSD Storage
- Stable Internet Connection

### Deployment

- Windows Server or Linux Server
- SQL Server
- Internet Connectivity

---

## Software

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- ASP.NET Core Web API (.NET 8)
- Entity Framework Core

### Database

- Microsoft SQL Server

### Development Tools

- Visual Studio 2022
- Visual Studio Code
- SQL Server Management Studio
- Git
- GitHub
- Postman

---

# 7. Constraints

- No real banking integration.
- No real financial transactions.
- Dummy credit card data only.
- Rule-based fraud detection.
- Educational use only.

---

# 8. Assumptions

- Users have internet access.
- Email delivery through SMTP2GO is available.
- SQL Server is operational.
- The application runs on modern web browsers.

---

# 9. Acceptance Criteria

The project will be considered complete when:

- Users can register and log in securely.
- Customers can manage simulated cards.
- Customers can successfully make simulated payments.
- Merchants can view received payments.
- Administrators can manage the system.
- Fraud detection rules are applied correctly.
- Email notifications are sent successfully.
- Transaction receipts are generated.
- Reports are available.
- The application follows the defined layered architecture.

---

# 10. Future Enhancements

- AI-based fraud detection
- Mobile application
- Multi-language support
- Multiple currencies
- QR code payments
- UPI simulation
- SMS notifications
- Audit logging
- Cloud-native deployment
- Microservices architecture