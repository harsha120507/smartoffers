using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartOffer.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferImageUrlsAndBanner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerImageUrl",
                table: "Offers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "Offers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerImageUrl",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "Offers");
        }
    }
}
