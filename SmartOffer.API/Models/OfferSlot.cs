namespace SmartOffer.API.Models;

public class OfferSlot
{
    public int Id { get; set; }
    public int OfferId { get; set; }
    public Offer? Offer { get; set; }
    
    public DateTime SlotDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    
    public int Capacity { get; set; }
    public int BookedCount { get; set; }
    public int AvailableCount => Capacity - BookedCount;
    
    public string Status { get; set; } = "Available"; // Available, Full, Closed, Expired, Cancelled
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
