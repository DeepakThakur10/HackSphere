describe("Leaderboard Ranking & Tie-Breaker Logic", () => {
  const calculateRankings = (submissions) => {
    return [...submissions].sort((a, b) => {
      // Rule 1: Higher total score
      if (b.score !== a.score) return b.score - a.score;
      // Rule 2: Higher Innovation score
      if (b.innovation !== a.innovation) return b.innovation - a.innovation;
      // Rule 3: Higher Technical Complexity score
      if (b.technicalComplexity !== a.technicalComplexity) return b.technicalComplexity - a.technicalComplexity;
      // Rule 4: Earlier submission timestamp
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });
  };

  test("ranks submissions by total score in descending order", () => {
    const data = [
      { id: "A", score: 65, innovation: 9, technicalComplexity: 9, submittedAt: "2026-07-29T10:00:00Z" },
      { id: "B", score: 69, innovation: 10, technicalComplexity: 9, submittedAt: "2026-07-29T11:00:00Z" },
    ];
    const ranked = calculateRankings(data);
    expect(ranked[0].id).toBe("B");
    expect(ranked[1].id).toBe("A");
  });

  test("applies innovation tie-breaker when total scores are equal", () => {
    const data = [
      { id: "TeamAlpha", score: 60, innovation: 8, technicalComplexity: 9, submittedAt: "2026-07-29T10:00:00Z" },
      { id: "TeamBeta", score: 60, innovation: 10, technicalComplexity: 7, submittedAt: "2026-07-29T10:30:00Z" },
    ];
    const ranked = calculateRankings(data);
    expect(ranked[0].id).toBe("TeamBeta");
    expect(ranked[1].id).toBe("TeamAlpha");
  });

  test("applies submission timestamp tie-breaker when all scores match", () => {
    const data = [
      { id: "LaterTeam", score: 60, innovation: 9, technicalComplexity: 9, submittedAt: "2026-07-29T12:00:00Z" },
      { id: "EarlierTeam", score: 60, innovation: 9, technicalComplexity: 9, submittedAt: "2026-07-29T09:00:00Z" },
    ];
    const ranked = calculateRankings(data);
    expect(ranked[0].id).toBe("EarlierTeam");
    expect(ranked[1].id).toBe("LaterTeam");
  });
});
