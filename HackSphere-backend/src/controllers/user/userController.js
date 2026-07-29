import User from "../../models/user.js";
import Hackathon from "../../models/Hackathon.js";
import Registration from "../../models/Registration.js";

export const getOrganizerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const organizer = await User.findById(id).select("firstName lastName email username role profilePicture createdAt");
    if (!organizer) {
      return res.status(404).json({ success: false, message: "Organizer profile not found" });
    }

    const hackathons = await Hackathon.find({ createdBy: id })
      .select("title mode status registrationStart registrationEnd hackathonStart hackathonEnd prizePool banner location")
      .sort({ createdAt: -1 });

    const hackathonIds = hackathons.map((h) => h._id);
    const totalRegistrations = await Registration.countDocuments({ hackathon: { $in: hackathonIds } });

    return res.status(200).json({
      success: true,
      data: {
        organizer,
        stats: {
          totalHackathons: hackathons.length,
          publishedHackathons: hackathons.filter((h) => h.status === "published" || h.status === "ongoing" || h.status === "completed").length,
          totalParticipantsImpacted: totalRegistrations,
        },
        hackathons,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch organizer profile",
      error: error.message,
    });
  }
};
