using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Data;
using SmartOffer.API.Models;
using System.Security.Claims;

namespace SmartOffer.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.Offer)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
        return Ok(bookings);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest("User email not found in token claims.");
        }

        var bookings = await _context.Bookings
            .Include(b => b.Offer)
            .Include(b => b.Slot)
            .Where(b => b.CustomerEmail == email)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Offer)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
    {
        var slot = await _context.OfferSlots.Include(s => s.Offer).FirstOrDefaultAsync(s => s.Id == booking.SlotId);
        if (slot == null) return BadRequest("Slot not found");
        if (slot.Offer == null) return BadRequest("Offer not found");

        if (slot.Offer.Status != "Active" || (slot.Status != "Available" && slot.Status != "Full"))
            return BadRequest("Slot or Offer is not available");

        if (slot.Offer.EndDate < DateTime.UtcNow.Date)
            return BadRequest("Offer has expired");

        var existingBookingsCount = await _context.Bookings
            .Where(b => b.CustomerPhone == booking.CustomerPhone && b.OfferId == booking.OfferId && b.Status != "Cancelled")
            .SumAsync(b => b.PeopleCount);

        if (existingBookingsCount + booking.PeopleCount > slot.Offer.MaxBookingPerCustomer)
            return BadRequest("Max booking limit exceeded for this customer");

        // Generate unique reference
        booking.BookingReference = $"BK-{DateTime.UtcNow.Ticks}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

        // Check if there is enough capacity; if not, automatically waitlist the booking
        if (slot.AvailableCount < booking.PeopleCount)
        {
            booking.Status = "Waitlisted";
        }
        else
        {
            booking.Status = "Confirmed";
            slot.BookedCount += booking.PeopleCount;
            if (slot.BookedCount >= slot.Capacity)
            {
                slot.Status = "Full";
            }
        }

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateStatusRequest req)
    {
        var booking = await _context.Bookings
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return NotFound();

        var oldStatus = booking.Status;
        var newStatus = req.Status;

        if (oldStatus != newStatus)
        {
            if (booking.Slot != null)
            {
                bool oldTookCapacity = oldStatus != "Cancelled" && oldStatus != "Waitlisted";
                bool newTakesCapacity = newStatus != "Cancelled" && newStatus != "Waitlisted";

                if (oldTookCapacity && !newTakesCapacity)
                {
                    // Release capacity
                    booking.Slot.BookedCount = Math.Max(0, booking.Slot.BookedCount - booking.PeopleCount);
                    if (booking.Slot.Status == "Full" && booking.Slot.BookedCount < booking.Slot.Capacity)
                    {
                        booking.Slot.Status = "Available";
                    }
                    
                    booking.Status = newStatus;
                    await _context.SaveChangesAsync();
                    await PromoteWaitlistEntries(booking.SlotId);
                }
                else if (!oldTookCapacity && newTakesCapacity)
                {
                    // Re-claim or take capacity
                    if (booking.Slot.AvailableCount < booking.PeopleCount)
                    {
                        return BadRequest("Not enough capacity in the slot to confirm this booking.");
                    }
                    booking.Slot.BookedCount += booking.PeopleCount;
                    if (booking.Slot.BookedCount >= booking.Slot.Capacity)
                    {
                        booking.Slot.Status = "Full";
                    }
                    
                    booking.Status = newStatus;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    booking.Status = newStatus;
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                booking.Status = newStatus;
                await _context.SaveChangesAsync();
            }
        }

        return NoContent();
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest("User email not found in token claims.");
        }

        var booking = await _context.Bookings
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return NotFound();

        // Verify ownership
        if (booking.CustomerEmail != email)
        {
            return Forbid();
        }

        if (booking.Status == "Cancelled")
        {
            return BadRequest("Booking is already cancelled.");
        }

        var oldStatus = booking.Status;
        booking.Status = "Cancelled";

        if (booking.Slot != null && oldStatus != "Cancelled" && oldStatus != "Waitlisted")
        {
            booking.Slot.BookedCount = Math.Max(0, booking.Slot.BookedCount - booking.PeopleCount);
            if (booking.Slot.Status == "Full" && booking.Slot.BookedCount < booking.Slot.Capacity)
            {
                booking.Slot.Status = "Available";
            }
            
            await _context.SaveChangesAsync();
            await PromoteWaitlistEntries(booking.SlotId);
        }
        else
        {
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    private async Task PromoteWaitlistEntries(int slotId)
    {
        var slot = await _context.OfferSlots
            .Include(s => s.Offer)
            .FirstOrDefaultAsync(s => s.Id == slotId);

        if (slot == null || slot.AvailableCount <= 0) return;

        // Get active waitlisted bookings for this slot in FIFO order
        var waitlist = await _context.Bookings
            .Where(b => b.SlotId == slotId && b.Status == "Waitlisted")
            .OrderBy(b => b.CreatedAt)
            .ToListAsync();

        foreach (var b in waitlist)
        {
            if (slot.AvailableCount >= b.PeopleCount)
            {
                b.Status = "Confirmed";
                slot.BookedCount += b.PeopleCount;
                if (slot.BookedCount >= slot.Capacity)
                {
                    slot.Status = "Full";
                }
            }
            if (slot.AvailableCount <= 0) break;
        }

        await _context.SaveChangesAsync();
    }
}

public class UpdateStatusRequest
{
    public required string Status { get; set; }
}
