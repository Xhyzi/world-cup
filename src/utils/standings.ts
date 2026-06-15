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

  if (stored.completed && stored.standings.length >= 4) {
    return {
      standings: stored.standings,
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
