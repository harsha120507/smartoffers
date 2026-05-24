using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Models;
using System.Security.Claims;

namespace SmartOffer.API.Data;

public class FirebaseClaimsTransformation : IClaimsTransformation
{
    private readonly IServiceProvider _serviceProvider;

    public FirebaseClaimsTransformation(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // If the principal is not authenticated, do nothing
        if (principal.Identity == null || !principal.Identity.IsAuthenticated)
        {
            return principal;
        }

        // Check if role claim is already present
        if (principal.HasClaim(c => c.Type == ClaimTypes.Role))
        {
            return principal;
        }

        // Get email from Firebase claims
        var emailClaim = principal.FindFirst("email") ?? principal.FindFirst(ClaimTypes.Email);
        if (emailClaim == null || string.IsNullOrEmpty(emailClaim.Value))
        {
            return principal;
        }

        // Create a scope to resolve AppDbContext
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim.Value);
        string role = "Customer"; // Default role if not in database

        if (user != null)
        {
            role = user.Role;
        }
        else
        {
            // Auto-create user as Customer in local database if they authenticated via Firebase
            var nameClaim = principal.FindFirst("name") ?? principal.FindFirst(ClaimTypes.Name);
            user = new User
            {
                Email = emailClaim.Value,
                Name = nameClaim?.Value ?? emailClaim.Value.Split('@')[0],
                Role = "Customer",
                PasswordHash = null
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
        }

        var identity = (ClaimsIdentity)principal.Identity;
        identity.AddClaim(new Claim(ClaimTypes.Role, role));
        identity.AddClaim(new Claim(ClaimTypes.Name, user.Name));
        identity.AddClaim(new Claim("UserId", user.Id.ToString()));

        return principal;
    }
}
