function isFinishedGroupMatch(match) {
  return (
    match.stage === 'GROUP_STAGE' &&
    match.status === 'FINISHED' &&
    match.homeTeam !== null &&
    match.awayTeam !== null &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

function getGroupMatchCounts(groupId, teamIds, matches) {
  const counts = new Map(teamIds.map((id) => [id, 0]));
  for (const match of matches) {
    if (match.group !== groupId || !isFinishedGroupMatch(match)) continue;
    counts.set(match.homeTeam, (counts.get(match.homeTeam) ?? 0) + 1);
    counts.set(match.awayTeam, (counts.get(match.awayTeam) ?? 0) + 1);
  }
  return counts;
}

function sortGroupStats(stats) {
  return [...stats].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.teamId.localeCompare(b.teamId),
  );
}

export function computeGroupStatsFromMatches(groupId, teamIds, matches) {
  const stats = new Map(
    teamIds.map((id) => [
      id,
      { teamId: id, points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0 },
    ]),
  );

  for (const match of matches) {
    if (match.group !== groupId || !isFinishedGroupMatch(match)) continue;

    const home = stats.get(match.homeTeam);
    const away = stats.get(match.awayTeam);
    if (!home || !away) continue;

    const homeScore = match.homeScore;
    const awayScore = match.awayScore;

    home.goalsFor += homeScore;
    away.goalsFor += awayScore;
    home.goalsAgainst += awayScore;
    away.goalsAgainst += homeScore;
    home.goalDifference += homeScore - awayScore;
    away.goalDifference += awayScore - homeScore;

    if (homeScore > awayScore) {
      home.points += 3;
    } else if (homeScore < awayScore) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  return sortGroupStats([...stats.values()]);
}

export function computeStandingsFromMatches(groupId, teamIds, matches) {
  return computeGroupStatsFromMatches(groupId, teamIds, matches).map(
    (row) => row.teamId,
  );
}

export function isGroupCompleteFromMatches(groupId, teamIds, matches) {
  const playedCounts = getGroupMatchCounts(groupId, teamIds, matches);
  return teamIds.every((id) => (playedCounts.get(id) ?? 0) >= 3);
}

export function computeBestThirds(groups, groupStandings, matches) {
  const candidates = [];

  for (const group of groups) {
    const standings = groupStandings[group.id];
    if (!standings || standings.length < 3) continue;

    const thirdId = standings[2];
    const stats = computeGroupStatsFromMatches(
      group.id,
      group.teamIds,
      matches,
    ).find((row) => row.teamId === thirdId);
    if (!stats) continue;

    candidates.push({
      teamId: thirdId,
      groupId: group.id,
      points: stats.points,
      goalDifference: stats.goalDifference,
      goalsFor: stats.goalsFor,
    });
  }

  return candidates
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.groupId.localeCompare(b.groupId),
    )
    .slice(0, 8)
    .map((row) => row.teamId);
}

/** Updates groupResults, bestThirds, and phase from finished matches. */
export function syncGroupResultsFromMatches(current, groups, matches) {
  let allComplete = true;
  const groupStandings = {};

  for (const group of groups) {
    const existing = current.groupResults[group.id] ?? {
      standings: [],
      completed: false,
    };

    if (existing.completed && existing.standings.length >= 4) {
      current.groupResults[group.id] = existing;
      groupStandings[group.id] = existing.standings;
      continue;
    }

    const complete = isGroupCompleteFromMatches(
      group.id,
      group.teamIds,
      matches,
    );

    if (complete) {
      const standings = computeStandingsFromMatches(
        group.id,
        group.teamIds,
        matches,
      );
      current.groupResults[group.id] = { standings, completed: true };
      groupStandings[group.id] = standings;
    } else {
      allComplete = false;
      if (existing.standings.length >= 4) {
        current.groupResults[group.id] = existing;
        groupStandings[group.id] = existing.standings;
      } else {
        current.groupResults[group.id] = { standings: [], completed: false };
        groupStandings[group.id] = [];
      }
    }
  }

  if (allComplete) {
    current.bestThirds = computeBestThirds(groups, groupStandings, matches);
    if (current.phase === 'groups') current.phase = 'knockout';
  }

  return current;
}
