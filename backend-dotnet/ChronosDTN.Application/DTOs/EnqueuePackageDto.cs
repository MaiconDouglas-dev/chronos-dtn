using System.ComponentModel.DataAnnotations;

namespace ChronosDTN.Application.DTOs
{
    public class EnqueuePackageDto
    {
        [Required(ErrorMessage = "Payload is required.")]
        public string Payload { get; set; } = string.Empty;

        [Required(ErrorMessage = "Source Node ID is required.")]
        public long SourceNodeId { get; set; }

        [Required(ErrorMessage = "Destination Node ID is required.")]
        public long DestinationNodeId { get; set; }

        [Required(ErrorMessage = "Operator ID is required.")]
        public long OperatorId { get; set; }

        [Required(ErrorMessage = "Size is required.")]
        [Range(1, long.MaxValue, ErrorMessage = "Size must be greater than zero.")]
        public long Size { get; set; }

        [Required(ErrorMessage = "Expiration Time (in microseconds) is required.")]
        [Range(1, long.MaxValue, ErrorMessage = "Expiration time must be a valid microsecond timestamp.")]
        public long ExpirationTimeUs { get; set; }
    }
}
