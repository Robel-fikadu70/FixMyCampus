
using System.Security.Claims;
using System.Text;

using FixMyCampus.Application.Common.Interfaces;
using FixMyCampus.Application.Services;
using FixMyCampus.Domain.Common.Interfaces;
using FixMyCampus.Infrastructure.Persistence;
using FixMyCampus.Infrastructure.Security;

using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using Scalar.AspNetCore;


var builder = WebApplication.CreateBuilder(args);


// ============================================================
// 1. CONTROLLERS & DATABASE
// ============================================================

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddScoped<IAppDbContext>(sp =>
    sp.GetRequiredService<AppDbContext>()
);


// ============================================================
// 2. APPLICATION & INFRASTRUCTURE SERVICES
// ============================================================

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ILookupService, LookupService>();


// ============================================================
// 3. CORS - ANGULAR
// ============================================================

var allowedOrigins =
    builder.Configuration
        .GetSection("AllowedOrigins")
        .Get<string[]>()
    ?? new[]
    {
        "http://localhost:4200"
    };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// ============================================================
// 4. ANTI-FORGERY PROTECTION
// ============================================================

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";

    options.Cookie.Name = "XSRF-TOKEN";

    // Angular needs to read this cookie.
    options.Cookie.HttpOnly = false;

    options.Cookie.SameSite = SameSiteMode.Strict;

    options.Cookie.SecurePolicy =
        CookieSecurePolicy.SameAsRequest;
});


// ============================================================
// 5. JWT AUTHENTICATION
// ============================================================

var jwtSettings =
    builder.Configuration.GetSection("Jwt");

var jwtSecretKey = jwtSettings["SecretKey"];

if (string.IsNullOrWhiteSpace(jwtSecretKey))
{
    throw new InvalidOperationException(
        "JWT SecretKey is missing from configuration."
    );
}


builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtSettings["Issuer"],

                ValidAudience = jwtSettings["Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSecretKey)
                    ),

                RoleClaimType = ClaimTypes.Role,

                NameClaimType = ClaimTypes.NameIdentifier
            };


        // --------------------------------------------------------
        // Extract JWT from BOTH:
        //
        // 1. Authorization: Bearer <token>
        // 2. HttpOnly fmc_token cookie
        // --------------------------------------------------------

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // =================================================
                // 1. CHECK AUTHORIZATION HEADER
                // =================================================

                var authHeader =
                    context.Request.Headers["Authorization"]
                        .FirstOrDefault();

                if (
                    !string.IsNullOrEmpty(authHeader) &&
                    authHeader.StartsWith(
                        "Bearer ",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    context.Token =
                        authHeader["Bearer ".Length..].Trim();

                    return Task.CompletedTask;
                }


                // =================================================
                // 2. CHECK HTTP-ONLY COOKIE
                // =================================================

                if (
                    context.Request.Cookies.TryGetValue(
                        "fmc_token",
                        out var cookieToken
                    )
                )
                {
                    context.Token = cookieToken;
                }

                return Task.CompletedTask;
            }
        };
    });


// ============================================================
// 6. AUTHORIZATION
// ============================================================

builder.Services.AddAuthorization();


// ============================================================
// 7. OPENAPI / SWAGGER
// ============================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "FixMyCampus API",
            Version = "v1",
            Description =
                "FixMyCampus Campus Complaint Management API"
        }
    );


    // ========================================================
    // BEARER AUTHENTICATION
    // ========================================================

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type = SecuritySchemeType.Http,

            Scheme = "Bearer",

            BearerFormat = "JWT",

            In = ParameterLocation.Header,

            Description =
                "Enter your JWT token. Example: Bearer eyJhbGciOi..."
        }
    );


    // ========================================================
    // BEARER SECURITY REQUIREMENT
    // ========================================================
    //
    // This syntax is required by the newer
    // Microsoft.OpenApi package version.
    //
    // OpenApiSecurityRequirement expects:
    //
    // OpenApiSecuritySchemeReference
    // +
    // List<string>
    //
    // ========================================================

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer"),
                new List<string>()
            }
        }
    );
});


// ============================================================
// 8. BUILD APPLICATION
// ============================================================

var app = builder.Build();


// ============================================================
// 9. DATABASE SEEDING
// ============================================================

using (var scope = app.Services.CreateScope())
{
    var context =
        scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

    var hasher =
        scope.ServiceProvider
            .GetRequiredService<IPasswordHasher>();

    await DbInitializer.SeedAsync(
        context,
        hasher
    );
}


// ============================================================
// 10. SCALAR API DOCUMENTATION
// ============================================================

if (app.Environment.IsDevelopment())
{
    // --------------------------------------------------------
    // Swagger generates the OpenAPI JSON document.
    // --------------------------------------------------------

    app.UseSwagger(c =>
    {
        c.RouteTemplate =
            "openapi/{documentName}.json";
    });


    // --------------------------------------------------------
    // Scalar UI
    // --------------------------------------------------------

    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("FixMyCampus API")

            .WithTheme(ScalarTheme.Mars)

            .WithOpenApiRoutePattern(
                "/openapi/{documentName}.json"
            );
    });
}


// ============================================================
// 11. HTTPS
// ============================================================

app.UseHttpsRedirection();


// ============================================================
// 12. CORS
// ============================================================

app.UseCors("AngularPolicy");


// ============================================================
// 13. ANTI-FORGERY COOKIE
// ============================================================

app.Use(async (context, next) =>
{
    var antiforgery =
        context.RequestServices
            .GetRequiredService<IAntiforgery>();

    var tokens =
        antiforgery.GetAndStoreTokens(context);


    if (!string.IsNullOrEmpty(tokens.RequestToken))
    {
        context.Response.Cookies.Append(
            "XSRF-TOKEN",
            tokens.RequestToken,
            new CookieOptions
            {
                HttpOnly = false,

                SameSite = SameSiteMode.Strict,

                Secure = context.Request.IsHttps
            }
        );
    }


    await next();
});


// ============================================================
// 14. AUTHENTICATION
// ============================================================
//
// Authentication MUST come before Authorization.
//

app.UseAuthentication();


// ============================================================
// 15. AUTHORIZATION
// ============================================================

app.UseAuthorization();


// ============================================================
// 16. CONTROLLERS
// ============================================================

app.MapControllers();


// ============================================================
// 17. RUN
// ============================================================

app.Run();
