# Do's and Don'ts

## Project Scope

This project is a **Credit Card Processing System Simulator** developed for educational purposes. It demonstrates how credit card transactions are processed through different system components without connecting to real banks or payment gateways.

---

# ✅ Do's

## General

- Simulate the complete credit card payment process.
- Keep the project modular and maintainable.
- Follow a layered architecture.
- Write clean, readable, and well-documented code.
- Use Git for version control.
- Follow REST API best practices.
- Use meaningful naming conventions.

---

## Authentication

- Implement secure user registration and login.
- Hash passwords using BCrypt.
- Authenticate users using JWT.
- Implement role-based authorization.
- Support three user roles:
  - Customer
  - Merchant
  - Admin

---

## Customer Module

- Register and log in.
- View profile.
- Add multiple cards.
- View saved cards.
- Make payments.
- View transaction history.
- Search transactions.
- Download payment receipt (PDF).

---

## Merchant Module

- Register and log in.
- View received payments.
- View payment history.
- View sales statistics.

---

## Admin Module

- View all users.
- View all cards.
- View all transactions.
- Block or unblock cards.
- Monitor suspicious transactions.
- Generate reports.
- View dashboard statistics.

---

## Card Management

- Add new cards.
- Mask card numbers.
- Validate expiry date.
- Validate CVV.
- Enable or disable cards.

---

## Payment Processing

Simulate the following workflow:

Customer

↓

Merchant

↓

Payment Gateway

↓

Bank Verification

↓

Approve / Decline

↓

Store Transaction

---

## Fraud Detection

Implement simple fraud rules such as:

- Amount greater than ₹50,000
- Expired card
- Blocked card
- Insufficient balance
- More than five transactions within one minute

Log suspicious transactions.

---

## Dashboard

Provide dashboards with:

- Total transactions
- Successful payments
- Failed payments
- Monthly statistics
- Fraud statistics

---

## Database

Use SQL Server with proper relationships.

Include tables such as:

- Users
- Cards
- Merchants
- Transactions
- FraudLogs
- OTP
- Reports

---

## API

Create REST APIs for:

- Authentication
- Users
- Cards
- Payments
- Transactions
- Merchants
- Admin

Document APIs using Swagger.

---

## Validation

Validate:

- Email
- Password
- Card number
- CVV
- Expiry date
- Payment amount

Validate both frontend and backend.

---

## Security

- Use JWT authentication.
- Hash passwords.
- Protect sensitive routes.
- Validate all user input.
- Use HTTPS where possible.
- Store secrets in environment variables.

---

## UI/UX

- Responsive design
- Clean dashboard
- Professional color scheme
- Loading indicators
- Success and error messages

---

## Documentation

Prepare:

- SRS
- ER Diagram
- DFD
- Use Case Diagram
- Activity Diagram
- Sequence Diagram
- Class Diagram
- Database Schema
- Test Cases
- User Manual

---

# ❌ Don'ts

## Payment Integration

Do NOT integrate:

- Stripe
- Razorpay
- PayPal
- PhonePe
- Google Pay
- Any real payment gateway

All payment processing must be simulated.

---

## Banking APIs

Do NOT connect to:

- Real banks
- Banking APIs
- Financial institutions

---

## Real Money

Do NOT process:

- Real payments
- Actual credit cards
- Live transactions

Use only dummy data.

---

## Sensitive Data

Do NOT store:

- Plain-text passwords
- Plain-text CVVs
- Real card information
- Real banking credentials

Use dummy or hashed values where appropriate.

---

## Authentication

Do NOT:

- Store JWT tokens insecurely.
- Hardcode passwords.
- Hardcode secret keys.
- Skip authorization checks.

---

## Database

Do NOT:

- Store duplicate data unnecessarily.
- Ignore foreign key relationships.
- Skip database normalization.
- Write raw SQL without parameterization.

---

## Backend

Do NOT:

- Put all logic inside controllers.
- Mix business logic with database code.
- Ignore exception handling.
- Ignore logging.

Use a layered architecture.

---

## Frontend

Do NOT:

- Hardcode API URLs.
- Duplicate components.
- Ignore form validation.
- Ignore loading states.
- Ignore error handling.

---

## Security

Do NOT:

- Expose API keys.
- Commit `.env` files to GitHub.
- Disable authentication.
- Trust client-side validation only.

Always validate data on the server.

---

## Project Scope

Do NOT implement:

- Real banking systems
- UPI integration
- Cryptocurrency payments
- NFC payments
- EMV chip simulation
- PCI-DSS certification
- Machine Learning fraud detection
- AI-based recommendations
- Biometric authentication

These features are outside the scope of this academic project.

---

## Deployment

Do NOT deploy with:

- Debug mode enabled
- Default credentials
- Test passwords
- Exposed database connections

---

## Code Quality

Do NOT:

- Write duplicate code.
- Ignore coding standards.
- Leave unused files.
- Leave commented-out code.
- Ignore warnings.

---

## Documentation

Do NOT submit the project without:

- API documentation
- Database schema
- UML diagrams
- Test cases
- Screenshots
- Proper README

---

# Project Goal Reminder

This project aims to **simulate** the workflow of a credit card payment system for learning and demonstration purposes.

The focus is on:

- Software Engineering principles
- System design
- Secure coding practices
- Database design
- REST API development
- Enterprise application architecture

It is **not** intended to replace or interact with real-world financial systems.