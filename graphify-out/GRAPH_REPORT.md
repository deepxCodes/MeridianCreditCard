# Graph Report - .  (2026-08-08)

## Corpus Check
- 108 files · ~44,271 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 563 nodes · 1027 edges · 40 communities (27 shown, 13 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34

## God Nodes (most connected - your core abstractions)
1. `SecurePay.API.Enums` - 32 edges
2. `SecurePayDbContext` - 26 edges
3. `SecurePay.API.Models.Entities` - 23 edges
4. `compilerOptions` - 18 edges
5. `User` - 16 edges
6. `compilerOptions` - 15 edges
7. `SecurePay.API.Models.DTOs.Responses` - 15 edges
8. `SecurePay.API.Models.DTOs.Requests` - 13 edges
9. `SecurePay.API` - 13 edges
10. `SecurePay.API.Services.Interfaces` - 13 edges

## Surprising Connections (you probably didn't know these)
- `User Management Rules` --rationale_for--> `User Entity`  [INFERRED]
  business_rules.md → database_Schema.md
- `React Frontend Component` --conceptually_related_to--> `User Entity`  [INFERRED]
  System_archtiecture.md → database_Schema.md
- `Payment Processing Rules` --rationale_for--> `Transaction Entity`  [INFERRED]
  business_rules.md → database_Schema.md
- `Payment Gateway Simulator` --conceptually_related_to--> `Transaction Entity`  [INFERRED]
  System_archtiecture.md → database_Schema.md
- `Authentication API Endpoints` --references--> `User Entity`  [EXTRACTED]
  API_Specification.md → database_Schema.md

## Import Cycles
- None detected.

## Communities (40 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (21): SecurePay.API.Services.Implementations, SecurePay.API.Middleware, SecurePay.API.Models.Entities, SecurePay.API.Data.Context, SecurePay.API.Data.Seed, SecurePay.API.ServicesInternal.FraudDetection, SecurePay.API.ServicesInternal.Notification, SecurePay.API.Configuration (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (37): App(), AddCardModal(), AddCardModalProps, CreditCardItem(), CreditCardItemProps, Navbar(), NavbarProps, PaymentModal() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (29): DbContext, DbSet, HttpContext, ModelBuilder, SecurePayDbContext, Task, DatabaseSeeder, NotificationStatus (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (20): CancellationToken, HttpGet, HttpPut, IActionResult, Task, AdminController, DateTime, MerchantProfileDto (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (18): Authorize, CancellationToken, HttpGet, IActionResult, Task, TransactionController, DateTime, TransactionDto (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (17): ClaimsPrincipal, IJwtTokenGenerator, JwtTokenGenerator, string, JwtSettings, CancellationToken, Task, AuthResponse (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (21): ControllerBase, HttpDelete, CancellationToken, HttpGet, HttpPost, HttpPut, IActionResult, Task (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (25): Authorize, CancellationToken, HttpPost, IActionResult, Task, PaymentController, FraudSeverity, TransactionStatus (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (28): axios, chart.js, dependencies, axios, chart.js, lucide-react, react, react-chartjs-2 (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (25): Administrative Operations API Endpoints, Authentication API Endpoints, Card Management API Endpoints, Payment Processing API Endpoints, Security Authentication Rules, Card Operation Rules, Fraud Detection Business Rules, Merchant Business Rules (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (22): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, devDependencies, oxlint, @types/node (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (12): Authorize, CancellationToken, HttpPost, IActionResult, Task, AuthController, UserRole, LoginRequest (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (9): NotificationType, OTPPurpose, CancellationToken, Task, INotificationService, CancellationToken, ILogger, Task (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (14): net10.0, BCrypt.Net-Next (4.2.0), MailKit (4.17.0), Microsoft.AspNetCore.Authentication.JwtBearer (10.0.10), Microsoft.AspNetCore.OpenApi (10.0.10), Microsoft.EntityFrameworkCore.Design (10.0.10), Microsoft.EntityFrameworkCore.InMemory (10.0.10), Microsoft.EntityFrameworkCore.SqlServer (10.0.10) (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (6): CancellationToken, Expression, Func, IReadOnlyList, Task, IRepository

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (5): IEnumerable, HttpGet, string, WeatherForecastController, WeatherForecast

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): SecurePay.API, DateOnly, WeatherForecast

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (3): Asynchronous Programming Style, Backend-First Strategy, ASP.NET Core Web API

## Knowledge Gaps
- **120 isolated node(s):** `AuditLog Entity`, `Layered Architecture`, `React Frontend Component`, `Repository Pattern`, `SQL Server Database Layer` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SecurePayDbContext` connect `Community 2` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 15`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `SecurePay.API.Enums` connect `Community 0` to `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `Repository` connect `Community 5` to `Community 0`, `Community 17`, `Community 2`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `AuditLog Entity`, `Layered Architecture`, `React Frontend Component` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07957393483709273 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09877551020408164 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._