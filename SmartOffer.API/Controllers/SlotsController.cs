using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Data;
using SmartOffer.API.Models;

namespace SmartOffer.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SlotsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSlots()
    {
        var slots = await _context.OfferSlots.Include(s => s.Offer).ToListAsync();
        return Ok(slots);
    }

    [HttpGet("/api/offers/{offerId}/slots")]
    public async Task<IActionResult> GetSlotsForOffer(int offerId)
    {
        var slots = await _context.OfferSlots
            .Where(s => s.OfferId == offerId)
            .ToListAsync();
        return Ok(slots);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateSlot([FromBody] OfferSlot slot)
    {
        _context.OfferSlots.Add(slot);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSlots), new { id = slot.Id }, slot);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSlot(int id, [FromBody] OfferSlot updatedSlot)
    {
        if (id != updatedSlot.Id) return BadRequest();

        _context.Entry(updatedSlot).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var slot = await _context.OfferSlots.FindAsync(id);
        if (slot == null) return NotFound();

        slot.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
