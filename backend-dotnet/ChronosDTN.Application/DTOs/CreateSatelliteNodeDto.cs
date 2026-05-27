using System.ComponentModel.DataAnnotations;

namespace ChronosDTN.Application.DTOs
{
    public class CreateSatelliteNodeDto
    {
        [Required(ErrorMessage = "Node name is required.")]
        [MaxLength(150, ErrorMessage = "Node name cannot exceed 150 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "IP Address is required.")]
        [MaxLength(50, ErrorMessage = "IP Address cannot exceed 50 characters.")]
        [RegularExpression(@"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", 
            ErrorMessage = "Invalid IP Address format.")]
        public string IpAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Port is required.")]
        [Range(1, 65535, ErrorMessage = "Port must be between 1 and 65535.")]
        public int Port { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters.")]
        public string Status { get; set; } = "Active";
    }
}
