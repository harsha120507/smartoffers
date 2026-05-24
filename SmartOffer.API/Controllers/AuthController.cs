using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Data;
using SmartOffer.API.Models;
using System.Security.Claims;

namespace SmartOffer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest("User email not found in token claims");
        }

        // Seed default admin in PostgreSQL if not present
        if (email == "admin@smartoffer.com")
        {
            var adminInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@smartoffer.com");
            if (adminInDb == null)
            {
                adminInDb = new User
                {
                    Name = "Admin Owner",
                    Email = "admin@smartoffer.com",
                    Role = "Admin",
                    PasswordHash = null
                };
                _context.Users.Add(adminInDb);
                await _context.SaveChangesAsync();
            }
        }

        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (dbUser == null)
        {
            // Auto-fallback: User authenticated by Firebase but not in local DB
            dbUser = new User
            {
                Name = User.FindFirstValue(ClaimTypes.Name) ?? email.Split('@')[0],
                Email = email,
                Role = "Customer",
                PasswordHash = null
            };
            _context.Users.Add(dbUser);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            dbUser.Id,
            dbUser.Name,
            dbUser.Email,
            dbUser.Role
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterLocalUser([FromBody] RegisterRequest request)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            // If the user already exists in PostgreSQL (e.g. pre-seeded Admin),
            // update their name and return the profile to link the Firebase account.
            existingUser.Name = request.Name;
            await _context.SaveChangesAsync();
            return Ok(existingUser);
        }

        // Default to Customer role unless email is admin@smartoffer.com
        string role = "Customer";
        if (request.Email.ToLower() == "admin@smartoffer.com")
        {
            role = "Admin";
        }

        var newUser = new User
        {
            Name = request.Name,
            Email = request.Email,
            Role = role,
            PasswordHash = null
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(newUser);
    }
}

public class RegisterRequest
{
    public required string Name { get; set; }
    public required string Email { get; set; }
}
