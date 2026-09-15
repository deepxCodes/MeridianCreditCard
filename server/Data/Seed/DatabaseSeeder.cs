using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.Data.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MeridianCreditDbContext dbContext)
    {
        // Apply pending EF Core migrations
        await dbContext.Database.MigrateAsync();

        // 1. Seed or update Admin
        var adminUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
        if (adminUser == null)
        {
            adminUser = new User
            {
                FullName = "DeepG Administrator",
                Email = "deepg@meridiancredit.com",
                Username = "deepg",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Deep@Admin23"),
                PhoneNumber = "+91 9876543210",
                Role = UserRole.Admin,
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await dbContext.Users.AddAsync(adminUser);
            await dbContext.SaveChangesAsync();
        }
        else
        {
            adminUser.Username = "deepg";
            adminUser.Email = "deepg@meridiancredit.com";
            adminUser.FullName = "DeepG Administrator";
            adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Deep@Admin23");
            adminUser.UpdatedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
        }

        // 2. Seed Merchants
        if (!await dbContext.Users.AnyAsync(u => u.Role == UserRole.Merchant))
        {
            var merchantUser1 = new User
            {
                FullName = "Amazon India Merchant",
                Email = "payments@amazon-sim.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Merchant@123"),
                PhoneNumber = "+91 9123456789",
                Role = UserRole.Merchant,
                IsEmailVerified = true
            };

            var merchantProfile1 = new MerchantProfile
            {
                User = merchantUser1,
                BusinessName = "Amazon Simulator Store",
                BusinessCategory = "E-Commerce",
                BusinessAddress = "Tech Park, Bengaluru, India",
                GSTNumber = "29AAAAA0000A1Z5",
                Website = "https://amazon-sim.com"
            };

            var merchantUser2 = new User
            {
                FullName = "Starbucks India",
                Email = "merchant@starbucks-sim.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Merchant@123"),
                PhoneNumber = "+91 9876500000",
                Role = UserRole.Merchant,
                IsEmailVerified = true
            };

            var merchantProfile2 = new MerchantProfile
            {
                User = merchantUser2,
                BusinessName = "Starbucks Coffee Simulator",
                BusinessCategory = "Food & Beverage",
                BusinessAddress = "Connaught Place, New Delhi, India",
                GSTNumber = "07BBBBB1111B2Z8",
                Website = "https://starbucks-sim.com"
            };

            await dbContext.MerchantProfiles.AddRangeAsync(
                merchantProfile1,
                merchantProfile2
            );

            await dbContext.SaveChangesAsync();
        }

        // 3. Seed Customer & Cards
        if (!await dbContext.Users.AnyAsync(u => u.Role == UserRole.Customer))
        {
            var customer = new User
            {
                FullName = "John Doe",
                Email = "customer@meridiancredit.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                PhoneNumber = "+91 9988776655",
                Role = UserRole.Customer,
                IsEmailVerified = true
            };

            var card1 = new Card
            {
                User = customer,
                CardHolderName = "JOHN DOE",
                MaskedCardNumber = "4111********1234",
                LastFourDigits = "1234",
                ExpiryMonth = 12,
                ExpiryYear = 2028,
                AvailableBalance = 150000.00m,
                CardStatus = CardStatus.Active
            };

            var card2 = new Card
            {
                User = customer,
                CardHolderName = "JOHN DOE",
                MaskedCardNumber = "5500********5678",
                LastFourDigits = "5678",
                ExpiryMonth = 6,
                ExpiryYear = 2027,
                AvailableBalance = 50000.00m,
                CardStatus = CardStatus.Active
            };

            var cardBlocked = new Card
            {
                User = customer,
                CardHolderName = "JOHN DOE",
                MaskedCardNumber = "4000********9999",
                LastFourDigits = "9999",
                ExpiryMonth = 3,
                ExpiryYear = 2026,
                AvailableBalance = 1000.00m,
                CardStatus = CardStatus.Blocked
            };

            await dbContext.Cards.AddRangeAsync(
                card1,
                card2,
                cardBlocked
            );

            await dbContext.SaveChangesAsync();
        }

        // 4. Seed Applications
        if (!await dbContext.CreditCardApplications.AnyAsync())
        {
            var customerUser = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Role == UserRole.Customer);

            if (customerUser != null)
            {
                var app1 = new CreditCardApplication
                {
                    UserId = customerUser.Id,
                    ApplicationReference = "MC-849201",
                    FullName = "John Doe",
                    DateOfBirth = "1992-05-14",
                    TaxIdNumber = "ABCDE1234F",
                    MobileNumber = "9988776655",
                    Email = "customer@meridiancredit.com",
                    Address = "Flat 402, Sunshine Heights, MG Road",
                    City = "Bengaluru",
                    State = "Karnataka",
                    ZipCode = "560001",
                    EmploymentType = "Salaried",
                    EmployerName = "Infosys Technologies Ltd",
                    JobTitle = "Senior Software Engineer",
                    WorkExperience = "5-10 years",
                    EmploymentDuration = "3 years",
                    OfficeAddress = "Electronics City, Bengaluru",
                    AnnualIncome = 1450000.00m,
                    ExistingLoans = "None",
                    ExistingCards = "HDFC Regalia",
                    MonthlyObligations = 25000.00m,
                    EstimatedExpenses = 35000.00m,
                    PrimaryBankAccountLast4 = "4921",
                    SelectedCardType = "Premium",
                    CurrentStage = 3,
                    IsRejected = false,
                    SubmittedAt = DateTime.UtcNow.AddDays(-2),
                    LastStageUpdatedAt = DateTime.UtcNow.AddDays(-1)
                };

                var app2 = new CreditCardApplication
                {
                    UserId = customerUser.Id,
                    ApplicationReference = "MC-719382",
                    FullName = "Priya Sharma",
                    DateOfBirth = "1996-11-20",
                    TaxIdNumber = "PQXYZ9876K",
                    MobileNumber = "9876501234",
                    Email = "priya.sharma@example.com",
                    Address = "12B, Rosewood Apartments, Bandra West",
                    City = "Mumbai",
                    State = "Maharashtra",
                    ZipCode = "400050",
                    EmploymentType = "Self-Employed",
                    EmployerName = "Sharma Creative Design Studio",
                    JobTitle = "Founder & Creative Director",
                    WorkExperience = "3-5 years",
                    EmploymentDuration = "4 years",
                    OfficeAddress = "Bandra Kurla Complex, Mumbai",
                    AnnualIncome = 950000.00m,
                    ExistingLoans = "Car Loan",
                    ExistingCards = "ICICI Coral",
                    MonthlyObligations = 18000.00m,
                    EstimatedExpenses = 28000.00m,
                    PrimaryBankAccountLast4 = "7732",
                    SelectedCardType = "Rewards",
                    CurrentStage = 2,
                    IsRejected = false,
                    SubmittedAt = DateTime.UtcNow.AddHours(-18),
                    LastStageUpdatedAt = DateTime.UtcNow.AddHours(-6)
                };

                await dbContext.CreditCardApplications.AddRangeAsync(
                    app1,
                    app2
                );

                await dbContext.SaveChangesAsync();
            }
        }
    }
}