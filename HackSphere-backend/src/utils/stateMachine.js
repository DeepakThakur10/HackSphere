export const TRANSITION_MAPS = {
  hackathon: {
    draft: ["published", "cancelled"],
    published: ["registration_closed", "cancelled"],
    registration_closed: ["ongoing", "cancelled"],
    ongoing: ["judging", "cancelled"],
    judging: ["completed", "cancelled"],
    completed: ["archived"],
    cancelled: ["archived"],
    archived: [],
  },

  team: {
    created: ["joining"],
    joining: ["locked"],
    locked: ["submitted"],
    submitted: ["completed"],
    completed: [],
  },

  registration: {
    pending: ["approved", "rejected", "cancelled"],
    approved: ["cancelled"],
    rejected: ["pending"],
    cancelled: [],
  },

  submission: {
    draft: ["submitted"],
    submitted: ["under_review"],
    under_review: ["scored"],
    scored: ["published"],
    published: [],
  },
};

export const canTransition = (domain, currentStatus, nextStatus) => {
  const domainMap = TRANSITION_MAPS[domain];
  if (!domainMap) {
    return false;
  }
  const allowed = domainMap[currentStatus] || [];
  return allowed.includes(nextStatus);
};
