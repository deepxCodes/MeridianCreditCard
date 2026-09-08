# UI_GUIDELINES.md

# Meridian Credit – Credit Card Processing System

Version: 1.0

---

# 1. Design Philosophy

Meridian Credit follows a clean, modern, enterprise-inspired design focused on:

- Simplicity
- Consistency
- Accessibility
- Performance
- Professional appearance

The interface should resemble modern financial platforms such as Stripe Dashboard, Razorpay Dashboard, GitHub, and Microsoft Azure Portal.

---

# 2. Theme

Primary Theme

- Light

Dark Theme

- Future Enhancement

---

# 3. Color Palette

## Primary

Blue

```
#2563EB
```

---

## Success

Green

```
#16A34A
```

---

## Error

Red

```
#DC2626
```

---

## Warning

Amber

```
#F59E0B
```

---

## Background

```
#F8FAFC
```

---

## Card Background

```
#FFFFFF
```

---

## Text

Primary

```
#0F172A
```

Secondary

```
#64748B
```

---

## Border

```
#E2E8F0
```

---

# 4. Typography

Primary Font

Inter

Fallback

```
sans-serif
```

Heading

- Font Weight: 700

Sub Heading

- Font Weight: 600

Body

- Font Weight: 400

Button

- Font Weight: 500

---

# 5. Border Radius

Standard

```
8px
```

Cards

```
12px
```

Buttons

```
8px
```

Input Fields

```
8px
```

---

# 6. Spacing

Use Tailwind spacing scale.

Preferred spacing:

- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 48px

Avoid arbitrary spacing values.

---

# 7. Shadows

Cards

```
shadow-sm
```

Dialogs

```
shadow-lg
```

Dropdown

```
shadow-md
```

Avoid excessive shadows.

---

# 8. Layout

Overall Layout

```
+---------------------------------------------+
| Navbar                                      |
+-----------+---------------------------------+
| Sidebar   | Main Content                    |
|           |                                 |
|           | Dashboard                       |
|           |                                 |
+-----------+---------------------------------+
```

Sidebar Width

```
260px
```

Navbar Height

```
64px
```

Content Padding

```
24px
```

---

# 9. Navigation

Main Navigation

- Dashboard
- Cards
- Payments
- Transactions
- Notifications
- Profile

Merchant Navigation

- Dashboard
- Transactions
- Profile

Admin Navigation

- Dashboard
- Users
- Merchants
- Cards
- Transactions
- Fraud Logs
- Reports

---

# 10. Dashboard Design

Every dashboard should contain:

- Welcome Banner
- KPI Cards
- Charts
- Recent Activity
- Quick Actions

---

# 11. KPI Cards

Display:

Customer

- Available Balance
- Total Cards
- Total Transactions
- Monthly Spending

Merchant

- Revenue
- Transactions
- Customers

Admin

- Users
- Merchants
- Transactions
- Fraud Cases

---

# 12. Tables

Use:

Shadcn UI + TanStack Table

Features

- Pagination
- Sorting
- Filtering
- Search
- Row Selection

---

# 13. Charts

Library

Recharts

Recommended Charts

- Line Chart
- Bar Chart
- Pie Chart
- Area Chart

Avoid excessive chart usage.

---

# 14. Forms

Use:

React Hook Form

Validation

Zod

Every form should have:

- Labels
- Placeholder
- Validation
- Helper Text
- Error Message

---

# 15. Buttons

Primary

Blue Filled

Secondary

Gray Outline

Danger

Red

Success

Green

Loading State

Spinner

Disabled State

Reduced opacity

---

# 16. Inputs

Standard Height

```
40px
```

Border Radius

```
8px
```

Validation

Real-time

---

# 17. Icons

Library

Lucide React

Use icons consistently for:

- Navigation
- Buttons
- Alerts
- Cards
- Tables

---

# 18. Notifications

Library

Sonner

Notification Types

- Success
- Error
- Warning
- Information

Display Position

Top Right

---

# 19. Modals

Use Shadcn Dialog

Used for:

- Delete Confirmation
- Payment Confirmation
- Fraud Details
- Profile Editing

---

# 20. Loading States

Every API request should show:

- Spinner
- Skeleton Loader
- Disabled Button

Avoid blank screens.

---

# 21. Empty States

Examples

No Transactions

No Cards

No Notifications

Display:

- Illustration
- Title
- Description
- CTA Button

---

# 22. Error Pages

Create pages for:

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Server Error

---

# 23. Responsive Design

Breakpoints

Mobile

```
<640px
```

Tablet

```
640px - 1024px
```

Desktop

```
>1024px
```

Desktop First Layout

Sidebar collapses on smaller devices.

---

# 24. Accessibility

Support:

- Keyboard Navigation
- Visible Focus States
- Semantic HTML
- ARIA Labels
- Sufficient Color Contrast

---

# 25. Animations

Library

Framer Motion

Use for:

- Page transitions
- Dialogs
- Sidebar
- Cards
- Toasts

Animation duration:

```
150ms–300ms
```

Keep animations subtle.

---

# 26. Page List

Authentication

- Login
- Register Customer
- Register Merchant
- Verify Email
- Forgot Password
- Reset Password

Customer

- Dashboard
- Cards
- Add Card
- Payments
- Transactions
- Notifications
- Profile

Merchant

- Dashboard
- Transactions
- Profile

Admin

- Dashboard
- Users
- Merchants
- Cards
- Transactions
- Fraud Logs
- Reports

Common

- Settings
- Error Pages

---

# 27. Component Guidelines

Reusable components include:

- Navbar
- Sidebar
- Footer
- Data Table
- Search Bar
- Pagination
- Confirmation Dialog
- Stat Card
- Chart Card
- Page Header
- Empty State
- Loading Skeleton
- Error Alert

---

# 28. UI Consistency Rules

- Use the same button styles throughout.
- Maintain consistent spacing.
- Keep typography uniform.
- Avoid more than three button styles on a page.
- Display success and error feedback for all user actions.
- Use consistent iconography.

---

# 29. Future Enhancements

- Dark Mode
- Theme Customization
- Multi-language Support
- High Contrast Mode
- User Preferences
- Mobile App Design System

---

# Version History

| Version | Date       | Description               |
|---------|------------|---------------------------|
| 1.0     | 2026-08-05 | Initial UI Design System  |