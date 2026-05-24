namespace SmartOffer.API.Models;

public class Booking
{
    public int Id { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    
    public int OfferId { get; set; }
    public Offer? Offer { get; set; }
    
    public int SlotId { get; set; }
    public OfferSlot? Slot { get; set; }
    
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    
    public int PeopleCount { get; set; }
    public string? SpecialNote { get; set; }
    
    public string Status { get; set; } = "Confirmed"; // Pending, Confirmed, Cancelled, Completed, No Show
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
