namespace ChronosDTN.Application.DTOs
{
    public class SatelliteNodeDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Status { get; set; } = string.Empty;
        public long CreatedAtUs { get; set; }
        public long UpdatedAtUs { get; set; }
    }
}
