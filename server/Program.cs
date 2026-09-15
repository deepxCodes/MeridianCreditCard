using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MeridianCredit.API.Authentication;
using MeridianCredit.API.Configuration;
using MeridianCredit.API.Data.Context;
using MeridianCredit.API.Data.Seed;
using MeridianCredit.API.Middleware;
using MeridianCredit.API.Services.Implementations;
using MeridianCredit.API.Services.Interfaces;
using MeridianCredit.API.ServicesInternal.FraudDetection;
using MeridianCredit.API.ServicesInternal.Notification;
using MeridianCredit.API.ServicesInternal.PaymentGateway;
using MeridianCredit.API.ServicesInternal.Pdf;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

// 2. Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=MeridianDb;Trusted_Connection=True;TrustServerCertificate=True";

builder.Services.AddDbContext<MeridianCreditDbContext>(options =>
{
    // Try SQL Server first
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 2,
            maxRetryDelay: TimeSpan.FromSeconds(3),
            errorNumbersToAdd: null);
    });
});

// 3. Register Authentication & JWT
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("MerchantOnly", policy => policy.RequireRole("Merchant"));
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
});

// 4. Register Services & Dependencies
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Internal Services
builder.Services.AddScoped<IFraudDetectionEngine, FraudDetectionEngine>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPdfReceiptGenerator, PdfReceiptGenerator>();
builder.Services.AddScoped<IPaymentGatewayService, PaymentGatewayService>();

// 5. Add Controllers & CORS
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Add Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Meridian Credit Processing API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

var app = builder.Build();

// 7. Auto-Seed Database on Startup (with graceful fallback to InMemory DB if local SQL Server is offline)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MeridianCreditDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

    try
    {
        await DatabaseSeeder.SeedAsync(dbContext);
        logger.LogInformation("Database seeded successfully using SQL Server.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "SQL Server connection failed.");
        throw;
    }
}

// 8. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Meridian Credit API v1");
    });
}

app.UseRouting();
app.UseCors("AllowFrontend");
// IP whitelist middleware for admin routes
app.UseMiddleware<IpWhitelistMiddleware>();
// Dev Auth Bypass Middleware
app.UseMiddleware<DevAuthBypassMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
