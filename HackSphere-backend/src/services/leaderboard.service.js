import Review from "../models/Review.js";
import Submission from "../models/Submission.js";
import Hackathon from "../models/Hackathon.js";

export const calculateLeaderboard = async (hackathonId) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  // Fetch all submitted reviews for this hackathon
  const reviews = await Review.find({ hackathon: hackathonId, status: "submitted" })
    .populate("judge", "firstName lastName email username")
    .populate({
      path: "submission",
      populate: [
        { path: "user", select: "firstName lastName email username profilePicture" },
        { path: "team", select: "name members inviteCode" },
      ],
    });

  // Group reviews by submission ID
  const submissionMap = new Map();

  reviews.forEach((review) => {
    if (!review.submission) return;
    const subId = review.submission._id.toString();

    if (!submissionMap.has(subId)) {
      submissionMap.set(subId, {
        submission: review.submission,
        reviews: [],
      });
    }

    submissionMap.get(subId).reviews.push(review);
  });

  // Calculate aggregates and criteria averages for each submission
  const rankedItems = [];

  for (const [subId, data] of submissionMap.entries()) {
    const sub = data.submission;
    const subReviews = data.reviews;
    const reviewCount = subReviews.length;

    if (reviewCount === 0) continue;

    const sumTotalScore = subReviews.reduce((sum, r) => sum + (r.totalScore || 0), 0);
    const averageTotalScore = Number((sumTotalScore / reviewCount).toFixed(2));

    const sumInnovation = subReviews.reduce((sum, r) => sum + (r.scores?.innovation || 0), 0);
    const averageInnovation = Number((sumInnovation / reviewCount).toFixed(2));

    const sumTech = subReviews.reduce((sum, r) => sum + (r.scores?.technicalComplexity || 0), 0);
    const averageTech = Number((sumTech / reviewCount).toFixed(2));

    rankedItems.push({
      submissionId: sub._id,
      projectName: sub.projectName,
      problemStatement: sub.problemStatement,
      solution: sub.solution,
      githubUrl: sub.githubUrl,
      demoUrl: sub.demoUrl,
      techStack: sub.techStack,
      team: sub.team ? { id: sub.team._id, name: sub.team.name } : null,
      user: sub.user
        ? {
            id: sub.user._id,
            firstName: sub.user.firstName,
            lastName: sub.user.lastName,
            username: sub.user.username,
            profilePicture: sub.user.profilePicture,
          }
        : null,
      averageScore: averageTotalScore,
      averageInnovation,
      averageTech,
      reviewCount,
      submittedAt: sub.submittedAt || sub.createdAt,
    });
  }

  // Sort with deterministic tie-breakers:
  // 1. Higher averageTotalScore
  // 2. Higher averageInnovation
  // 3. Higher averageTech
  // 4. Earlier submission timestamp (submittedAt)
  rankedItems.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    if (b.averageInnovation !== a.averageInnovation) {
      return b.averageInnovation - a.averageInnovation;
    }
    if (b.averageTech !== a.averageTech) {
      return b.averageTech - a.averageTech;
    }
    return new Date(a.submittedAt) - new Date(b.submittedAt);
  });

  // Assign integer ranks
  const finalLeaderboard = rankedItems.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));

  return {
    hackathon: {
      id: hackathon._id,
      title: hackathon.title,
      status: hackathon.status,
    },
    leaderboard: finalLeaderboard,
  };
};

export const getWinnersSummary = async (hackathonId) => {
  const { hackathon, leaderboard } = await calculateLeaderboard(hackathonId);

  const champion = leaderboard[0] || null;
  const runnerUp = leaderboard[1] || null;
  const secondRunnerUp = leaderboard[2] || null;

  return {
    hackathon,
    winners: {
      champion,
      runnerUp,
      secondRunnerUp,
    },
  };
};
