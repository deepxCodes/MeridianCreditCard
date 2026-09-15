using Microsoft.EntityFrameworkCore;
using MeridianCredit.API.Enums;
using MeridianCredit.API.Models.Entities;

namespace MeridianCredit.API.Data.Context;

public class MeridianCreditDbContext : DbContext
{
    public MeridianCreditDbContext(DbContextOptions<MeridianCreditDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CreditCardApplication> CreditCardApplications => Set<CreditCardApplication>();
    public DbSet<MerchantProfile> MerchantProfiles => Set<MerchantProfile>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<FraudLog> FraudLogs => Set<FraudLog>();
    public DbSet<OTP> OTPs => Set<OTP>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- User Configuration ---
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Role);
            entity.HasIndex(u => u.IsDeleted);
            entity.Property(u => u.Role).HasConversion<string>();
            entity.HasQueryFilter(u => !u.IsDeleted);
        });

        // --- MerchantProfile Configuration ---
        modelBuilder.Entity<MerchantProfile>(entity =>
        {
            entity.HasIndex(m => m.BusinessName);
            entity.HasOne(m => m.User)
                  .WithOne(u => u.MerchantProfile)
                  .HasForeignKey<MerchantProfile>(m => m.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(m => !m.IsDeleted);
        });

        // --- Card Configuration ---
        modelBuilder.Entity<Card>(entity =>
        {
            entity.HasIndex(c => c.UserId);
            entity.HasIndex(c => c.LastFourDigits);
            entity.HasIndex(c => c.CardStatus);
            entity.HasIndex(c => c.IsDeleted);
            entity.Property(c => c.CardStatus).HasConversion<string>();
            entity.Property(c => c.AvailableBalance).HasPrecision(18, 2);
            entity.Property(c => c.CreditLimit).HasPrecision(18, 2);
            entity.HasOne(c => c.User)
                  .WithMany(u => u.Cards)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(c => !c.IsDeleted);
        });

        // --- Transaction Configuration ---
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasIndex(t => t.TransactionReference).IsUnique();
            entity.HasIndex(t => t.CustomerId);
            entity.HasIndex(t => t.MerchantId);
            entity.HasIndex(t => t.CardId);
            entity.HasIndex(t => t.TransactionStatus);
            entity.HasIndex(t => t.ProcessedAt);
            entity.Property(t => t.Amount).HasPrecision(18, 2);
            entity.Property(t => t.Currency).HasMaxLength(3).HasDefaultValue("INR");
            entity.Property(t => t.TransactionStatus).HasConversion<string>();

            entity.HasOne(t => t.Card)
                  .WithMany(c => c.Transactions)
                  .HasForeignKey(t => t.CardId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Customer)
                  .WithMany(u => u.Transactions)
                  .HasForeignKey(t => t.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Merchant)
                  .WithMany(m => m.Transactions)
                  .HasForeignKey(t => t.MerchantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // --- FraudLog Configuration ---
        modelBuilder.Entity<FraudLog>(entity =>
        {
            entity.HasIndex(f => f.TransactionId);
            entity.HasIndex(f => f.Severity);
            entity.HasIndex(f => f.IsResolved);
            entity.Property(f => f.Severity).HasConversion<string>();

            entity.HasOne(f => f.Transaction)
                  .WithOne(t => t.FraudLog)
                  .HasForeignKey<FraudLog>(f => f.TransactionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // --- OTP Configuration ---
        modelBuilder.Entity<OTP>(entity =>
        {
            entity.HasIndex(o => o.UserId);
            entity.HasIndex(o => o.ExpiresAt);
            entity.HasIndex(o => o.IsUsed);
            entity.Property(o => o.Purpose).HasConversion<string>();

            entity.HasOne(o => o.User)
                  .WithMany(u => u.OTPs)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(o => !o.User.IsDeleted);
        });

        // --- Notification Configuration ---
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(n => n.UserId);
            entity.HasIndex(n => n.Status);
            entity.HasIndex(n => n.NotificationType);
            entity.Property(n => n.NotificationType).HasConversion<string>();
            entity.Property(n => n.Status).HasConversion<string>();

            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(n => !n.User.IsDeleted);
        });

        // --- AuditLog Configuration ---
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => a.Action);
            entity.HasIndex(a => a.CreatedAt);

            entity.HasOne(a => a.User)
                  .WithMany(u => u.AuditLogs)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // --- RefreshToken Configuration ---
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(r => r.Token).IsUnique();
            entity.HasIndex(r => r.UserId);
            entity.HasIndex(r => r.ExpiresAt);
            entity.HasIndex(r => r.IsRevoked);

            entity.HasOne(r => r.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(r => !r.User.IsDeleted);
        });

        // --- CreditCardApplication Configuration ---
        modelBuilder.Entity<CreditCardApplication>(entity =>
        {
            entity.HasIndex(a => a.ApplicationReference).IsUnique();
            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => a.CurrentStage);
            entity.Property(a => a.AnnualIncome).HasPrecision(18, 2);
            entity.Property(a => a.MonthlyObligations).HasPrecision(18, 2);
            entity.Property(a => a.EstimatedExpenses).HasPrecision(18, 2);

            entity.HasOne(a => a.User)
                  .WithMany(u => u.Applications)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.IssuedCard)
                  .WithMany()
                  .HasForeignKey(a => a.IssuedCardId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasQueryFilter(a => !a.IsDeleted);
        });

        // --- SupportTicket Configuration ---
        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.HasIndex(s => s.UserId);
            entity.HasIndex(s => s.Status);

            entity.HasOne(s => s.User)
                  .WithMany()
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasQueryFilter(s => !s.IsDeleted);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        var now = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
