import Review from "../../models/Review.js";
import Submission from "../../models/Submission.js";
import HackathonJudge from "../../models/HackathonJudge.js";
import Hackathon from "../../models/Hackathon.js";

export const createOrUpdateReview = async (req, res) => {
  try {
    const { submissionId, scores, comments, isSubmit } = req.body;

    if (!submissionId) {
      return res.status(400).json({ success: false, message: "Submission ID is required" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Verify judge assignment
    const isAssigned = await HackathonJudge.findOne({
      hackathon: submission.hackathon,
      judge: req.user.id,
      status: { $ne: "removed" },
    });

    const isAdmin = req.user.role === "admin";

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not an assigned judge for this hackathon",
      });
    }

    const safeScores = {
      innovation: Math.min(10, Math.max(0, Number(scores?.innovation) || 0)),
      technicalComplexity: Math.min(10, Math.max(0, Number(scores?.technicalComplexity) || 0)),
      uiUx: Math.min(10, Math.max(0, Number(scores?.uiUx) || 0)),
      functionality: Math.min(10, Math.max(0, Number(scores?.functionality) || 0)),
      scalability: Math.min(10, Math.max(0, Number(scores?.scalability) || 0)),
      documentation: Math.min(10, Math.max(0, Number(scores?.documentation) || 0)),
      presentation: Math.min(10, Math.max(0, Number(scores?.presentation) || 0)),
    };

    const totalScore = Object.values(safeScores).reduce((acc, curr) => acc + curr, 0);
    const newStatus = isSubmit ? "submitted" : "draft";

    const payload = {
      submission: submissionId,
      hackathon: submission.hackathon,
      judge: req.user.id,
      scores: safeScores,
      comments: comments ? comments.trim() : "",
      totalScore,
      status: newStatus,
      ...(isSubmit ? { submittedAt: new Date() } : {}),
    };

    const existing = await Review.findOne({ submission: submissionId, judge: req.user.id });
    let review;

    if (existing) {
      review = await Review.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true });
    } else {
      review = await Review.create(payload);
    }

    if (isSubmit) {
      submission.status = "scored";
      await submission.save();
    } else if (submission.status === "submitted") {
      submission.status = "under_review";
      await submission.save();
    }

    return res.status(200).json({
      success: true,
      message: isSubmit ? "Evaluation review submitted successfully" : "Review draft saved",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save review evaluation",
      error: error.message,
    });
  }
};

export const getAssignedSubmissionsForJudge = async (req, res) => {
  try {
    const judgeId = req.user.id;

    // Find assigned hackathons
    const assignments = await HackathonJudge.find({ judge: judgeId, status: { $ne: "removed" } });
    const hackathonIds = assignments.map((a) => a.hackathon);

    const submissions = await Submission.find({ hackathon: { $in: hackathonIds } })
      .populate("user", "firstName lastName email username profilePicture")
      .populate("team")
      .populate("hackathon", "title mode status");

    const reviews = await Review.find({ judge: judgeId });
    const reviewMap = new Map();
    reviews.forEach((r) => reviewMap.set(r.submission.toString(), r));

    const result = submissions.map((sub) => ({
      submission: sub,
      review: reviewMap.get(sub._id.toString()) || null,
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned submissions",
      error: error.message,
    });
  }
};

export const getReviewBySubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const review = await Review.findOne({ submission: submissionId, judge: req.user.id });

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};
