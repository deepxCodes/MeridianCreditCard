# API_SPECIFICATION.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# API Overview

Meridian Credit exposes RESTful APIs over HTTPS.

Base URL

```

https://localhost:5001/api/v1

```

Authentication

- JWT Bearer Token

Content Type

```

application/json

```

---

# HTTP Status Codes

| Code | Meaning        |
|------|----------------|
|200   |Success         |
|201   |Created         |
|204   |No Content      |
|400   |Bad Request     |
|401   |Unauthorized    |
|403   |Forbidden       |
|404   |Not Found       |
|409   |Conflict        |
|422   |Validation Error|
|500   |Internal Server Error|

---

# Authentication Module

## Register Customer

POST

```

/auth/register/customer

```

Authorization

```

Public

```

Request

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

Response

```json
{
  "message":"Registration Successful",
  "emailVerificationRequired":true
}
```

---

## Register Merchant

POST

```

/auth/register/merchant

```

Request

```json
{
  "fullName":"ABC Store",
  "email":"merchant@example.com",
  "password":"Password@123",
  "businessName":"ABC Store",
  "businessCategory":"Electronics"
}
```

---

## Login

POST

```

/auth/login

```

Request

```json
{
  "email":"john@example.com",
  "password":"Password@123"
}
```

Response

```json
{
  "accessToken":"JWT",
  "refreshToken":"JWT",
  "expiresIn":900
}
```

---

## Refresh Token

POST

```

/auth/refresh

```

---

## Logout

POST

```

/auth/logout

```

---

## Verify Email

POST

```

/auth/verify-email

```

---

## Forgot Password

POST

```

/auth/forgot-password

```

---

## Reset Password

POST

```

/auth/reset-password

```

---

# Customer Module

Authorization

Customer

---

## Get Profile

GET

```

/customers/profile

```

---

## Update Profile

PUT

```

/customers/profile

```

---

## Get Dashboard

GET

```

/customers/dashboard

```

Returns

- Balance
- Recent Transactions
- Total Cards
- Monthly Spending

---

# Card Module

Authorization

Customer

---

## Get Cards

GET

```

/cards

```

---

## Get Card

GET

```

/cards/{id}

```

---

## Add Card

POST

```

/cards

```

---

## Update Card

PUT

```

/cards/{id}

```

---

## Block Card

PATCH

```

/cards/{id}/block

```

---

## Unblock Card

PATCH

```

/cards/{id}/unblock

```

---

## Delete Card

DELETE

```

/cards/{id}

```

Uses Soft Delete.

---

# Payment Module

Authorization

Customer

---

## Process Payment

POST

```

/payments/process

```

Request

```json
{
  "cardId":1,
  "merchantId":15,
  "amount":2500
}
```

Response

```json
{
  "transactionReference":"TXN202608060001",
  "status":"Approved",
  "message":"Payment Successful"
}
```

---

## Payment Status

GET

```

/payments/{transactionReference}

```

---

## Download Receipt

GET

```

/payments/{transactionReference}/receipt

```

Returns PDF.

---

# Transaction Module

Authorization

Customer

Merchant

Admin

---

## Customer Transactions

GET

```

/transactions

```

Supports

- Pagination
- Search
- Date Filter
- Status Filter

---

## Transaction Details

GET

```

/transactions/{id}

```

---

# Merchant Module

Authorization

Merchant

---

## Merchant Dashboard

GET

```

/merchant/dashboard

```

Returns

- Revenue
- Total Transactions
- Today's Sales
- Recent Payments

---

## Merchant Transactions

GET

```

/merchant/transactions

```

---

## Merchant Profile

GET

```

/merchant/profile

```

---

## Update Merchant Profile

PUT

```

/merchant/profile

```

---

# Notification Module

Authorization

Authenticated User

---

## Get Notifications

GET

```

/notifications

```

---

## Mark Notification Read

PATCH

```

/notifications/{id}/read

```

---

# Admin Module

Authorization

Admin

---

## Dashboard

GET

```

/admin/dashboard

```

Returns

- Users
- Merchants
- Cards
- Transactions
- Fraud Cases

---

## Get Users

GET

```

/admin/users

```

---

## Get User

GET

```

/admin/users/{id}

```

---

## Block User

PATCH

```

/admin/users/{id}/block

```

---

## Unblock User

PATCH

```

/admin/users/{id}/unblock

```

---

## Get Merchants

GET

```

/admin/merchants

```

---

## Get Transactions

GET

```

/admin/transactions

```

---

## Get Fraud Logs

GET

```

/admin/fraud

```

---

## Resolve Fraud Case

PATCH

```

/admin/fraud/{id}/resolve

```

---

## Reports

GET

```

/admin/reports

```

Supports

- Daily
- Weekly
- Monthly
- Custom Date Range

---

# Common Query Parameters

Pagination

```

?page=1&pageSize=10

```

Sorting

```

?sortBy=CreatedAt

```

Filtering

```

?status=Approved

```

Searching

```

?search=TXN202608060001

```

Date Filter

```

?from=2026-08-01&to=2026-08-31

```

---

# Error Response Format

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": [
    "Email is required",
    "Password is required"
  ]
}
```

---

# Success Response Format

```json
{
  "success": true,
  "message": "Operation Successful",
  "data": {}
}
```

---

# Authorization Matrix

| API                  | Customer  | Merchant   | Admin       |
|----------------------|:---------:|:----------:|:-----------:|
| Register             |      ✔    |      ✔    |      ✖     |
| Login                |      ✔    |      ✔    |      ✔     |
| Cards                |      ✔    |      ✖    |      ✖     |
| Payments             |      ✔    |      ✖    |      ✖     |
| Transactions         |      ✔    |      ✔    |      ✔     |
| Merchant Dashboard   |      ✖    |      ✔    |      ✖     |
| Admin Dashboard      |      ✖    |      ✖    |      ✔     |
| Fraud Logs           |      ✖    |      ✖    |      ✔     |

---

# API Versioning

Current Version

```
v1
```

Future versions

```
/api/v2/
/api/v3/
```

without affecting existing clients.

---

# Future APIs

Planned but not implemented

- Webhooks
- AI Fraud Analysis
- Mobile APIs
- Push Notifications
- Multi-Currency
- Debit Card Support

---

# Version History

| Version     | Date         | Description                   |
|-------------|--------------|-------------------------------|
| 1.0         | 2026-08-05   | Initial REST API Specification|
