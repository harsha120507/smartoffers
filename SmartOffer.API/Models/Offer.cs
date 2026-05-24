namespace SmartOffer.API.Models;

public class Offer
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public Business? Business { get; set; }
    
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public required string Category { get; set; }
    
    public decimal OriginalPrice { get; set; }
    public decimal OfferPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    
    public int TotalCapacity { get; set; }
    public int MaxBookingPerCustomer { get; set; }
    
    public string TermsAndConditions { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // Draft, Active, Paused, Expired, Cancelled
    
    public string ImageUrls { get; set; } = string.Empty;
    public string? BannerImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OfferSlot> Slots { get; set; } = new List<OfferSlot>();
}
