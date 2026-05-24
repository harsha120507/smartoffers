namespace SmartOffer.API.Models;

public class Business
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string BusinessType { get; set; }
    public required string OwnerName { get; set; }
    public required string Phone { get; set; }
    public required string Email { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public TimeSpan OpeningTime { get; set; }
    public TimeSpan ClosingTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
