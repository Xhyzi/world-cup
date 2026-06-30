import type { FixtureMatch, Group, GroupResult, MatchesData, Results } from '../types';

export interface EffectiveGroupResult extends GroupResult {
  firstRoundComplete: boolean;
}

function isFinishedGroupMatch(match: FixtureMatch): boolean {
  return (
    match.stage === 'GROUP_STAGE' &&
    match.status === 'FINISHED' &&
    match.homeTeam !== null &&
    match.awayTeam !== null &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

export function getGroupMatchCounts(
  groupId: string,
  teamIds: string[],
  matches: FixtureMatch[],
): Map<string, number> {
  const counts = new Map(teamIds.map((id) => [id, 0]));
  for (const match of matches) {
    if (match.group !== groupId || !isFinishedGroupMatch(match)) continue;
    counts.set(match.homeTeam!, (counts.get(match.homeTeam!) ?? 0) + 1);
    counts.set(match.awayTeam!, (counts.get(match.awayTeam!) ?? 0) + 1);
  }
  return counts;
}

/** All four teams have played at least one group match (one full round). */
export function hasCompletedFirstRound(
  teamIds: string[],
  playedCounts: Map<string, number>,
): boolean {
  return teamIds.every((id) => (playedCounts.get(id) ?? 0) >= 1);
}

export interface TeamGroupStats {
  teamId: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
  goalsAgainst: number;
}

function sortGroupStats(stats: TeamGroupStats[]): TeamGroupStats[] {
  return [...stats].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.teamId.localeCompare(b.teamId),
  );
}

export function computeGroupStatsFromMatches(
  groupId: string,
  teamIds: string[],
  matches: FixtureMatch[],
): TeamGroupStats[] {
  const stats = new Map(
    teamIds.map((id) => [
      id,
      { teamId: id, points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0 },
    ]),
  );

  for (const match of matches) {
    if (match.group !== groupId || !isFinishedGroupMatch(match)) continue;

    const home = stats.get(match.homeTeam!);
    const away = stats.get(match.awayTeam!);
    if (!home || !away) continue;

    const homeScore = match.homeScore!;
    const awayScore = match.awayScore!;

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

export function computeStandingsFromMatches(
  groupId: string,
  teamIds: string[],
  matches: FixtureMatch[],
): string[] {
  return computeGroupStatsFromMatches(groupId, teamIds, matches).map(
    (row) => row.teamId,
  );
}

export function hasFinishedGroupMatches(
  groupId: string,
  matches: FixtureMatch[],
): boolean {
  return matches.some(
    (match) => match.group === groupId && isFinishedGroupMatch(match),
  );
}

/** Each team has played all three group matches. */
export function isGroupCompleteFromMatches(
  groupId: string,
  teamIds: string[],
  matches: FixtureMatch[],
): boolean {
  const playedCounts = getGroupMatchCounts(groupId, teamIds, matches);
  return teamIds.every((id) => (playedCounts.get(id) ?? 0) >= 3);
}

interface ThirdPlaceCandidate {
  teamId: string;
  groupId: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

/** Top 8 third-placed teams by points, goal difference, goals scored. */
export function computeBestThirds(
  groups: Group[],
  groupStandings: Record<string, string[]>,
  matches: FixtureMatch[],
): string[] {
  const candidates: ThirdPlaceCandidate[] = [];

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

export function resolveGroupStandings(
  group: Group,
  results: Results,
  matches: MatchesData,
): EffectiveGroupResult {
  const stored = results.groupResults[group.id] ?? {
    standings: [],
    completed: false,
  };
  const playedCounts = getGroupMatchCounts(
    group.id,
    group.teamIds,
    matches.matches,
  );
  const firstRoundComplete = hasCompletedFirstRound(group.teamIds, playedCounts);
  const completeFromMatches = isGroupCompleteFromMatches(
    group.id,
    group.teamIds,
    matches.matches,
  );

  if (stored.completed && stored.standings.length >= 4) {
    return {
      standings: stored.standings,
      completed: true,
      firstRoundComplete: true,
    };
  }

  if (completeFromMatches) {
    const standings = computeStandingsFromMatches(
      group.id,
      group.teamIds,
      matches.matches,
    );
    return {
      standings,
      completed: true,
      firstRoundComplete: true,
    };
  }

  if (!firstRoundComplete) {
    return {
      standings: [],
      completed: false,
      firstRoundComplete: false,
    };
  }

  const standings =
    stored.standings.length >= 4
      ? stored.standings
      : computeStandingsFromMatches(group.id, group.teamIds, matches.matches);

  return {
    standings,
    completed: false,
    firstRoundComplete: true,
  };
}

/** Merges stored results with match-derived standings, completion, and best thirds. */
export function resolveEffectiveResults(
  groups: Group[],
  results: Results,
  matches: MatchesData,
): Results {
  const groupResults: Record<string, GroupResult> = {};
  let allComplete = true;

  for (const group of groups) {
    const effective = resolveGroupStandings(group, results, matches);
    groupResults[group.id] = {
      standings: effective.standings,
      completed: effective.completed,
    };
    if (!effective.completed) allComplete = false;
  }

  const standingsByGroup = Object.fromEntries(
    groups.map((group) => [group.id, groupResults[group.id].standings]),
  );

  const bestThirds =
    results.bestThirds.length > 0
      ? results.bestThirds
      : allComplete
        ? computeBestThirds(groups, standingsByGroup, matches.matches)
        : [];

  const knockoutStarted = results.knockoutMatches.some(
    (match) => match.completed || match.homeTeam !== null,
  );

  const phase =
    results.phase === 'finished'
      ? 'finished'
      : allComplete || results.phase === 'knockout' || knockoutStarted
        ? 'knockout'
        : 'groups';

  return {
    ...results,
    phase,
    groupResults,
    bestThirds,
  };
}

export function buildTemporalSnapshot(
  groups: Group[],
  results: Results,
  matches: MatchesData,
): Record<string, EffectiveGroupResult> {
  return Object.fromEntries(
    groups.map((group) => [
      group.id,
      resolveGroupStandings(group, results, matches),
    ]),
  );
}
