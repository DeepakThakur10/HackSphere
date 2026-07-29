import Hackathon from "../../models/Hackathon.js";

const VALID_STATUSES = [
  "draft",
  "published",
  "registration_closed",
  "ongoing",
  "judging",
  "completed",
  "cancelled",
  "archived",
];

export const updateHackathonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    hackathon.status = status;
    await hackathon.save();

    const updated = await Hackathon.findById(id).populate("createdBy", "firstName lastName email");

    return res.status(200).json({
      success: true,
      message: `Hackathon status updated to '${status}' successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update hackathon status",
      error: error.message,
    });
  }
};
