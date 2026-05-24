using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Data;
using SmartOffer.API.Models;

namespace SmartOffer.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class BusinessController : ControllerBase
{
    private readonly AppDbContext _context;

    public BusinessController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBusinesses()
    {
        var businesses = await _context.Businesses.ToListAsync();
        return Ok(businesses);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBusiness([FromBody] Business business)
    {
        _context.Businesses.Add(business);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBusiness), new { id = business.Id }, business);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBusiness(int id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return NotFound();
        return Ok(business);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusiness(int id, [FromBody] Business updatedBusiness)
    {
        if (id != updatedBusiness.Id) return BadRequest();

        _context.Entry(updatedBusiness).State = EntityState.Modified;
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BusinessExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    private bool BusinessExists(int id)
    {
        return _context.Businesses.Any(e => e.Id == id);
    }
}
