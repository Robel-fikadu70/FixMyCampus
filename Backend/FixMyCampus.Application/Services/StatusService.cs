namespace FixMyCampus.Application.Services;

public static class StatusService
{
    // Allowed transitions mapping
    public static bool IsValidTransition(string currentStatus, string newStatus, string userRole, bool isAssignedTechnician)
    {
        // Normalize strings
        currentStatus = currentStatus?.Trim() ?? "";
        newStatus = newStatus?.Trim() ?? "";

        // 1. New -> Assigned (Admin only)
        if (currentStatus == "New" && newStatus == "Assigned")
        {
            return userRole == "Admin";
        }

        // 2. Assigned -> In Progress (Assigned Technician only)
        if (currentStatus == "Assigned" && newStatus == "In Progress")
        {
            return userRole == "Technician" && isAssignedTechnician;
        }

        // 3. In Progress -> Resolved (Assigned Technician only)
        if (currentStatus == "In Progress" && newStatus == "Resolved")
        {
            return userRole == "Technician" && isAssignedTechnician;
        }

        // 4. Resolved -> Closed (Reporter only)
        if (currentStatus == "Resolved" && newStatus == "Closed")
        {
            return userRole == "Reporter";
        }

        // 5. Resolved -> In Progress (Reporter rejects fix, requires comment)
        if (currentStatus == "Resolved" && newStatus == "In Progress")
        {
            return userRole == "Reporter";
        }

        // Any other transition is illegal (e.g., New -> Resolved, Closed -> New, etc.)
        return false;
    }
}