namespace ChronosDTN.Domain.Entities
{
    public class SatelliteNode
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Status { get; set; } = string.Empty; // Active, Inactive, etc.
        
        // Microsecond timestamps (using long)
        public long CreatedAtUs { get; set; }
        public long UpdatedAtUs { get; set; }
    }
}
