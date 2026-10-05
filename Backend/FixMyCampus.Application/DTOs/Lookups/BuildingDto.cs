namespace FixMyCampus.Application.DTOs.Lookups;

public class BuildingDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class RoomDto
{
    public int Id { get; set; }
    public int BuildingId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
}
public class CreateBuildingDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class CreateRoomDto
{
    public string RoomNumber { get; set; } = string.Empty;
}