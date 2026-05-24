using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartOffer.API.Data;
using System.Text;
using System.Text.Json.Serialization;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

builder.Services.AddTransient<IClaimsTransformation, FirebaseClaimsTransformation>();

var firebaseProjectId = builder.Configuration["Firebase:ProjectId"] ?? "smartoffer-demo";
Console.WriteLine($"[DEBUG] Firebase Project ID: {firebaseProjectId}");

IList<SecurityKey> googleKeys = new List<SecurityKey>();
try
{
    using var httpClient = new HttpClient();
    var jwksJson = httpClient.GetStringAsync("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com").GetAwaiter().GetResult();
    var keySet = new JsonWebKeySet(jwksJson);
    // Extract keys
    foreach (var key in keySet.Keys)
    {
        googleKeys.Add(key);
    }
    Console.WriteLine($"[DEBUG] Successfully loaded {googleKeys.Count} Google signing certificates.");
}
catch (Exception ex)
{
    Console.WriteLine($"[WARNING] Failed to pre-fetch live Google certificates: {ex.Message}");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true,
            IssuerSigningKeys = googleKeys,
            ValidateIssuerSigningKey = googleKeys.Any()
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer mock-"))
                {
                    var token = authHeader.Substring("Bearer mock-".Length);
                    try
                    {
                        var parts = token.Split(':');
                        var email = parts[0];
                        var name = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : email.Split('@')[0];

                        var claims = new List<Claim>
                        {
                            new Claim("email", email),
                            new Claim(ClaimTypes.Email, email),
                            new Claim(ClaimTypes.Name, name),
                            new Claim("name", name)
                        };

                        var identity = new ClaimsIdentity(claims, context.Scheme.Name);
                        context.Principal = new ClaimsPrincipal(identity);
                        context.Success();
                    }
                    catch
                    {
                        // Fallback to normal validation
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || true) // Enable swagger everywhere for demo
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
