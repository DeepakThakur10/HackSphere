import User from "../../models/user.js";
import AuditLog from "../../models/AuditLog.js";

export const getAllUsersAdmin = async (req, res) => {
  try {
    const { search, role } = req.query;

    const query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { username: regex },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user roster",
      error: error.message,
    });
  }
};

export const toggleUserBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (targetUser.role === "admin" && req.user.id !== targetUser._id.toString()) {
      return res.status(403).json({ success: false, message: "Cannot block administrator account" });
    }

    targetUser.isBlocked = !targetUser.isBlocked;
    await targetUser.save();

    await AuditLog.create({
      user: req.user.id,
      action: targetUser.isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
      entityType: "User",
      entityId: targetUser._id,
      metadata: { targetUserEmail: targetUser.email, isBlocked: targetUser.isBlocked },
    });

    return res.status(200).json({
      success: true,
      message: `User ${targetUser.isBlocked ? "blocked" : "unblocked"} successfully`,
      data: targetUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user block status",
      error: error.message,
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["participant", "organizer", "judge", "admin"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(", ")}` });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await AuditLog.create({
      user: req.user.id,
      action: "USER_ROLE_UPDATED",
      entityType: "User",
      entityId: targetUser._id,
      metadata: { targetUserEmail: targetUser.email, previousRole, newRole: role },
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}' successfully`,
      data: targetUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};
