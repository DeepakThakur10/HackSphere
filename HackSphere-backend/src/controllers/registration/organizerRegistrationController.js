import Registration from "../../models/Registration.js";

export const getOrganizerRegistrations = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const registrations = await Registration.find({ hackathon: hackathonId })
      .populate("user", "firstName lastName email username profilePicture")
      .populate({
        path: "team",
        populate: {
          path: "members",
          select: "firstName lastName email username profilePicture",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: error.message,
    });
  }
};

export const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    registration.status = "approved";
    await registration.save();

    const updated = await Registration.findById(id)
      .populate("user", "firstName lastName email username profilePicture")
      .populate("team");

    return res.status(200).json({
      success: true,
      message: "Registration approved successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve registration",
      error: error.message,
    });
  }
};

export const rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    registration.status = "rejected";
    await registration.save();

    const updated = await Registration.findById(id)
      .populate("user", "firstName lastName email username profilePicture")
      .populate("team");

    return res.status(200).json({
      success: true,
      message: "Registration rejected",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject registration",
      error: error.message,
    });
  }
};
