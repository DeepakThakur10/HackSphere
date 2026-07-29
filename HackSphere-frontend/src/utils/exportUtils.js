export function exportLeaderboardToCSV(rankings = [], hackathonTitle = 'Hackathon') {
  if (!rankings || rankings.length === 0) return;

  const headers = ['Rank', 'Project Name', 'Team / Hacker', 'Average Score', 'Innovation', 'Technical Complexity', 'Submitted At'];
  const rows = rankings.map((r, index) => [
    r.rank || index + 1,
    `"${(r.projectName || r.submission?.projectName || 'Project').replace(/"/g, '""')}"`,
    `"${(r.teamName || r.team?.name || r.user?.firstName || 'Hacker').replace(/"/g, '""')}"`,
    r.score || r.averageScore || 0,
    r.criteriaBreakdown?.innovation || 0,
    r.criteriaBreakdown?.technicalComplexity || 0,
    `"${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${hackathonTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Leaderboard.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPageToPDF() {
  window.print();
}
