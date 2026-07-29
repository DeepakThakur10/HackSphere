import Hackathon from "../../models/Hackathon.js";
import Registration from "../../models/Registration.js";
import Team from "../../models/Team.js";

export const getOrganizerMetrics = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const myHackathons = await Hackathon.find({ createdBy: organizerId });
    const hackathonIds = myHackathons.map((h) => h._id);

    const totalHackathons = myHackathons.length;
    const drafts = myHackathons.filter((h) => h.status === "draft").length;
    const published = totalHackathons - drafts;

    const registrationsCount = await Registration.countDocuments({
      hackathon: { $in: hackathonIds },
    });

    const teamsCount = await Team.countDocuments({
      hackathon: { $in: hackathonIds },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalHackathons,
        published,
        drafts,
        registrations: registrationsCount,
        teams: teamsCount,
        submissions: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load organizer metrics",
      error: error.message,
    });
  }
};
