namespace SmartOffer.API.Data;

using Microsoft.EntityFrameworkCore;
using SmartOffer.API.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Business> Businesses { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<OfferSlot> OfferSlots { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal types
        modelBuilder.Entity<Offer>()
            .Property(o => o.OriginalPrice)
            .HasColumnType("decimal(18,2)");
            
        modelBuilder.Entity<Offer>()
            .Property(o => o.OfferPrice)
            .HasColumnType("decimal(18,2)");
            
        modelBuilder.Entity<Offer>()
            .Property(o => o.DiscountPercentage)
            .HasColumnType("decimal(5,2)");

        // Add constraints / relations if needed
        modelBuilder.Entity<Offer>()
            .HasOne(o => o.Business)
            .WithMany()
            .HasForeignKey(o => o.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OfferSlot>()
            .HasOne(s => s.Offer)
            .WithMany(o => o.Slots)
            .HasForeignKey(s => s.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Offer)
            .WithMany()
            .HasForeignKey(b => b.OfferId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Slot)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.SlotId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingReference)
            .IsUnique();
    }
}
