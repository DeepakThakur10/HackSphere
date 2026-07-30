import Submission from "../../models/Submission.js";
import Registration from "../../models/Registration.js";
import Hackathon from "../../models/Hackathon.js";
import Team from "../../models/Team.js";

export const createOrUpdateSubmission = async (req, res) => {
  try {
    const {
      hackathonId,
      projectName,
      problemStatement,
      solution,
      githubUrl,
      demoUrl,
      presentationUrl,
      videoUrl,
      screenshots,
      techStack,
      isSubmit,
    } = req.body;

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: "Hackathon ID is required" });
    }

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    if (!problemStatement || !problemStatement.trim()) {
      return res.status(400).json({ success: false, message: "Problem statement is required" });
    }

    if (!solution || !solution.trim()) {
      return res.status(400).json({ success: false, message: "Solution description is required" });
    }

    if (!githubUrl || !githubUrl.trim()) {
      return res.status(400).json({ success: false, message: "GitHub repository URL is required" });
    }

    const registration = await Registration.findOne({
      hackathon: hackathonId,
      user: req.user.id,
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You must be registered for this hackathon to submit a project",
      });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    // Lock submissions if results are declared or hackathon is completed/cancelled
    if (hackathon.status === "completed" || hackathon.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Submissions are locked as results have been declared for this hackathon.",
      });
    }

    let teamId = registration.team;

    let existingSubmission = null;
    if (teamId) {
      existingSubmission = await Submission.findOne({ hackathon: hackathonId, team: teamId });
    } else {
      existingSubmission = await Submission.findOne({ hackathon: hackathonId, user: req.user.id });
    }

    const newStatus = isSubmit ? "submitted" : "draft";

    const payload = {
      hackathon: hackathonId,
      team: teamId || null,
      user: req.user.id,
      projectName: projectName.trim(),
      problemStatement: problemStatement.trim(),
      solution: solution.trim(),
      githubUrl: githubUrl.trim(),
      demoUrl: demoUrl ? demoUrl.trim() : "",
      presentationUrl: presentationUrl ? presentationUrl.trim() : "",
      videoUrl: videoUrl ? videoUrl.trim() : "",
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      techStack: Array.isArray(techStack) ? techStack : [],
      status: newStatus,
      ...(isSubmit ? { submittedAt: new Date() } : {}),
    };

    let submission;
    if (existingSubmission) {
      const currentHistory = Array.isArray(existingSubmission.versionHistory) ? existingSubmission.versionHistory : [];
      const newVersion = currentHistory.length + 1;

      const historySnapshot = {
        version: newVersion,
        projectName: projectName.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl ? demoUrl.trim() : "",
        status: newStatus,
        timestamp: new Date(),
      };

      submission = await Submission.findByIdAndUpdate(
        existingSubmission._id,
        {
          ...payload,
          $push: { versionHistory: historySnapshot },
        },
        { new: true, runValidators: true }
      );
    } else {
      const historySnapshot = {
        version: 1,
        projectName: projectName.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl ? demoUrl.trim() : "",
        status: newStatus,
        timestamp: new Date(),
      };

      submission = await Submission.create({
        ...payload,
        versionHistory: [historySnapshot],
      });
    }

    if (isSubmit && teamId) {
      await Team.findByIdAndUpdate(teamId, {
        status: "submitted",
        submittedAt: new Date(),
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate("user", "firstName lastName email username profilePicture")
      .populate("team")
      .populate("hackathon", "title mode status");

    return res.status(200).json({
      success: true,
      message: isSubmit ? "Project submitted successfully!" : "Submission draft saved",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save submission",
      error: error.message,
    });
  }
};

export const getParticipantSubmission = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const registration = await Registration.findOne({
      hackathon: hackathonId,
      user: req.user.id,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No registration found for this hackathon",
      });
    }

    let submission = null;
    if (registration.team) {
      submission = await Submission.findOne({ hackathon: hackathonId, team: registration.team })
        .populate("user", "firstName lastName email username profilePicture")
        .populate("team")
        .populate("hackathon", "title mode status");
    } else {
      submission = await Submission.findOne({ hackathon: hackathonId, user: req.user.id })
        .populate("user", "firstName lastName email username profilePicture")
        .populate("hackathon", "title mode status");
    }

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate("user", "firstName lastName email username profilePicture")
      .populate({
        path: "team",
        populate: {
          path: "members",
          select: "firstName lastName email username profilePicture",
        },
      })
      .populate("hackathon", "title mode status");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission details",
      error: error.message,
    });
  }
};
