using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Data;

namespace SmartOffer.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalOffers = await _context.Offers.CountAsync();
        var activeOffers = await _context.Offers.CountAsync(o => o.Status == "Active");
        
        var totalBookings = await _context.Bookings.CountAsync();
        var todaysBookings = await _context.Bookings.CountAsync(b => b.CreatedAt.Date == DateTime.UtcNow.Date);

        var totalCapacity = await _context.OfferSlots.SumAsync(s => s.Capacity);
        var bookedSeats = await _context.OfferSlots.SumAsync(s => s.BookedCount);
        var availableSeats = totalCapacity - bookedSeats;

        var conversionRate = totalCapacity > 0 ? (double)bookedSeats / totalCapacity * 100 : 0;

        var recentBookings = await _context.Bookings
            .Include(b => b.Offer)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .Select(b => new
            {
                b.CustomerName,
                OfferName = b.Offer!.Title,
                SlotTime = $"{b.Slot!.SlotDate:yyyy-MM-dd} {b.Slot.StartTime:hh\\:mm} - {b.Slot.EndTime:hh\\:mm}",
                b.PeopleCount,
                b.Status
            })
            .ToListAsync();

        return Ok(new
        {
            TotalOffers = totalOffers,
            ActiveOffers = activeOffers,
            TotalBookings = totalBookings,
            TodaysBookings = todaysBookings,
            TotalCapacity = totalCapacity,
            BookedSeats = bookedSeats,
            AvailableSeats = availableSeats,
            ConversionRate = Math.Round(conversionRate, 2),
            RecentBookings = recentBookings
        });
    }
}
