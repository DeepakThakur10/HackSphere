import Team from "../models/Team.js";
import Registration from "../models/Registration.js";
import Hackathon from "../models/Hackathon.js";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HS-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createTeamService = async ({ name, hackathonId, userId }) => {
  const registration = await Registration.findOne({ hackathon: hackathonId, user: userId });
  if (!registration) {
    throw new Error("You must register for the hackathon before creating a team");
  }

  if (registration.team) {
    throw new Error("You are already part of a team for this hackathon");
  }

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.teamType === "individual") {
    throw new Error("This is an individual hackathon. Teams are not allowed");
  }

  let inviteCode = generateInviteCode();
  let isCodeUnique = false;
  while (!isCodeUnique) {
    const existing = await Team.findOne({ inviteCode });
    if (!existing) {
      isCodeUnique = true;
    } else {
      inviteCode = generateInviteCode();
    }
  }

  const team = await Team.create({
    name: name.trim(),
    hackathon: hackathonId,
    leader: userId,
    members: [userId],
    inviteCode,
    minSize: hackathon.minTeamSize || 1,
    maxSize: hackathon.maxTeamSize || 4,
    status: "joining",
  });

  registration.team = team._id;
  await registration.save();

  return team;
};

export const joinTeamService = async ({ inviteCode, userId }) => {
  const team = await Team.findOne({ inviteCode: inviteCode.trim().toUpperCase() }).populate("hackathon");
  if (!team) {
    throw new Error("Invalid team invite code");
  }

  if (team.status !== "created" && team.status !== "joining") {
    throw new Error("This team is locked and no longer accepting new members");
  }

  if (team.members.some((memberId) => memberId.toString() === userId.toString())) {
    throw new Error("You are already a member of this team");
  }

  if (team.members.length >= team.maxSize) {
    throw new Error(`Team is full (maximum ${team.maxSize} members allowed)`);
  }

  const registration = await Registration.findOne({ hackathon: team.hackathon._id, user: userId });
  if (!registration) {
    throw new Error("You must register for this hackathon before joining a team");
  }

  if (registration.team) {
    throw new Error("You are already in a team for this hackathon. Leave your current team first");
  }

  team.members.push(userId);
  await team.save();

  registration.team = team._id;
  await registration.save();

  return team;
};

export const leaveTeamService = async ({ teamId, userId }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (team.status === "locked" || team.status === "submitted" || team.status === "completed") {
    throw new Error("Cannot leave a team that is locked or has submitted projects");
  }

  const isMember = team.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new Error("You are not a member of this team");
  }

  // If last member leaves, delete team
  if (team.members.length === 1) {
    await Team.findByIdAndDelete(teamId);
    await Registration.updateMany({ team: teamId }, { team: null });
    return { deleted: true, message: "Team disbanded as the last member left" };
  }

  // If leader leaves, auto-promote next member
  if (team.leader.toString() === userId.toString()) {
    const remainingMembers = team.members.filter((m) => m.toString() !== userId.toString());
    team.leader = remainingMembers[0];
  }

  team.members = team.members.filter((m) => m.toString() !== userId.toString());
  await team.save();

  await Registration.findOneAndUpdate(
    { hackathon: team.hackathon, user: userId },
    { team: null }
  );

  return { deleted: false, team };
};

export const transferLeaderService = async ({ teamId, currentLeaderId, newLeaderId }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (team.leader.toString() !== currentLeaderId.toString()) {
    throw new Error("Only the team captain can transfer leadership");
  }

  const isNewLeaderMember = team.members.some((m) => m.toString() === newLeaderId.toString());
  if (!isNewLeaderMember) {
    throw new Error("Target leader must be a member of the team");
  }

  team.leader = newLeaderId;
  await team.save();

  return team;
};

export const lockTeamService = async ({ teamId, userId }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (team.leader.toString() !== userId.toString()) {
    throw new Error("Only the team captain can lock the team roster");
  }

  if (team.members.length < team.minSize) {
    throw new Error(`Team must have at least ${team.minSize} members to lock roster`);
  }

  if (!team.canTransitionTo("locked")) {
    throw new Error(`Cannot transition team from state '${team.status}' to 'locked'`);
  }

  team.status = "locked";
  team.lockedAt = new Date();
  await team.save();

  return team;
};
