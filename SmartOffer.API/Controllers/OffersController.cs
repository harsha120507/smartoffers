using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Data;
using SmartOffer.API.Models;

namespace SmartOffer.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OffersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OffersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetOffers([FromQuery] string? category, [FromQuery] string? businessType)
    {
        var query = _context.Offers
            .Include(o => o.Business)
            .Include(o => o.Slots)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(o => o.Category == category);
        }
        
        if (!string.IsNullOrEmpty(businessType))
        {
            query = query.Where(o => o.Business!.BusinessType == businessType);
        }

        // Only show active offers to public if not admin
        if (!User.IsInRole("Admin"))
        {
            query = query.Where(o => o.Status == "Active" && o.EndDate >= DateTime.UtcNow.Date);
        }

        var offers = await query.ToListAsync();
        return Ok(offers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOffer(int id)
    {
        var offer = await _context.Offers
            .Include(o => o.Business)
            .Include(o => o.Slots)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null) return NotFound();
        return Ok(offer);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateOffer([FromBody] Offer offer)
    {
        // Calculate discount percentage
        if (offer.OriginalPrice > 0)
        {
            offer.DiscountPercentage = ((offer.OriginalPrice - offer.OfferPrice) / offer.OriginalPrice) * 100;
        }

        _context.Offers.Add(offer);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, offer);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOffer(int id, [FromBody] Offer updatedOffer)
    {
        if (id != updatedOffer.Id) return BadRequest();

        if (updatedOffer.OriginalPrice > 0)
        {
            updatedOffer.DiscountPercentage = ((updatedOffer.OriginalPrice - updatedOffer.OfferPrice) / updatedOffer.OriginalPrice) * 100;
        }
        updatedOffer.UpdatedAt = DateTime.UtcNow;

        _context.Entry(updatedOffer).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOffer(int id)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer == null) return NotFound();

        offer.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
