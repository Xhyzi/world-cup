import type {
  Participant,
  Results,
  ScoreBreakdown,
  LeaderboardEntry,
  RoundKey,
  ScoreMode,
  Group,
  MatchesData,
} from '../types';
import {
  buildTemporalSnapshot,
  type EffectiveGroupResult,
} from './standings';

export const ROUND_POINTS: Record<RoundKey, number> = {
  r32: 5,
  r16: 10,
  qf: 25,
  sf: 50,
  third: 50,
  final: 150,
};

export const MAX_SCORE = {
  groupPositions: 192,
  groupPerfectBonus: 120,
  bestThirds: 64,
  passes: 64,
  r32: 80,
  r16: 80,
  qf: 100,
  sf: 100,
  third: 50,
  final: 150,
  groupTotal: 440,
  knockoutTotal: 560,
  total: 1000,
};

function groupCountsForMode(
  state: EffectiveGroupResult,
  mode: ScoreMode,
): boolean {
  if (state.standings.length < 4) return false;
  if (mode === 'consolidated') return state.completed;
  return state.firstRoundComplete;
}

function scoreGroupFromStandings(
  predicted: string[],
  standings: string[],
): { groupPositions: number; groupPerfectBonus: number } {
  let groupPositions = 0;
  let allCorrect = true;
  for (let i = 0; i < 4; i++) {
    if (predicted[i] === standings[i]) {
      groupPositions += 4;
    } else {
      allCorrect = false;
    }
  }
  return {
    groupPositions,
    groupPerfectBonus: allCorrect ? 10 : 0,
  };
}

/** 4 pts per correct position, +10 bonus if all 4 correct */
export function scoreGroupPositions(predicted: string[], actual: string[]): number {
  if (actual.length < 4) return 0;
  const { groupPositions, groupPerfectBonus } = scoreGroupFromStandings(
    predicted,
    actual,
  );
  return groupPositions + groupPerfectBonus;
}

/** 8 pts per correctly predicted best third */
export function scoreBestThirds(predicted: string[], actualBestThirds: string[]): number {
  if (actualBestThirds.length === 0) return 0;
  return predicted.filter((t) => actualBestThirds.includes(t)).length * 8;
}

/**
 * 2 pts per team correctly predicted to advance to R32.
 * Qualifiers = top 2 from each group + 8 best thirds.
 */
export function scorePasses(
  participant: Participant,
  results: Results,
  mode: ScoreMode = 'consolidated',
  temporalSnapshot?: Record<string, EffectiveGroupResult>,
): number {
  const qualifiers = new Set<string>();

  for (const groupId of Object.keys(results.groupResults)) {
    const state =
      mode === 'temporal' && temporalSnapshot
        ? temporalSnapshot[groupId]
        : {
            ...(results.groupResults[groupId] ?? { standings: [], completed: false }),
            firstRoundComplete: false,
          };

    if (!state || state.standings.length < 2) continue;
    if (mode === 'consolidated' && !state.completed) continue;
    if (mode === 'temporal' && !state.firstRoundComplete) continue;

    qualifiers.add(state.standings[0]);
    qualifiers.add(state.standings[1]);
  }

  results.bestThirds.forEach((t) => qualifiers.add(t));

  if (qualifiers.size === 0) return 0;

  let pts = 0;
  const predictedQualifiers = new Set<string>();
  for (const groupId of Object.keys(participant.groupPredictions)) {
    const pred = participant.groupPredictions[groupId];
    if (pred.length >= 2) {
      predictedQualifiers.add(pred[0]);
      predictedQualifiers.add(pred[1]);
    }
  }
  participant.bestThirdPredictions.forEach((t) => predictedQualifiers.add(t));

  predictedQualifiers.forEach((t) => {
    if (qualifiers.has(t)) pts += 2;
  });
  return pts;
}

/** Points for knockout rounds */
export function scoreKnockout(
  participant: Participant,
  results: Results
): Pick<ScoreBreakdown, 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'> {
  const breakdown = { r32: 0, r16: 0, qf: 0, sf: 0, third: 0, final: 0 };
  for (const match of results.knockoutMatches) {
    if (!match.completed || match.winner === null) continue;
    const predicted = participant.knockoutPredictions[match.id];
    if (predicted === match.winner) {
      const round = match.round as RoundKey;
      breakdown[round] += ROUND_POINTS[round];
    }
  }
  return breakdown;
}

export function computeScore(
  participant: Participant,
  results: Results,
  mode: ScoreMode = 'consolidated',
  temporalSnapshot?: Record<string, EffectiveGroupResult>,
): ScoreBreakdown {
  let groupPositions = 0;
  let groupPerfectBonus = 0;

  const groupIds = Object.keys(results.groupResults);

  for (const groupId of groupIds) {
    const state: EffectiveGroupResult =
      mode === 'temporal' && temporalSnapshot?.[groupId]
        ? temporalSnapshot[groupId]
        : {
            ...(results.groupResults[groupId] ?? { standings: [], completed: false }),
            firstRoundComplete: false,
          };

    if (!groupCountsForMode(state, mode)) continue;

    const pred = participant.groupPredictions[groupId] ?? [];
    const scored = scoreGroupFromStandings(pred, state.standings);
    groupPositions += scored.groupPositions;
    groupPerfectBonus += scored.groupPerfectBonus;
  }

  const bestThirds = scoreBestThirds(participant.bestThirdPredictions, results.bestThirds);
  const passes = scorePasses(participant, results, mode, temporalSnapshot);
  const kp = scoreKnockout(participant, results);

  const groupTotal = groupPositions + groupPerfectBonus + bestThirds + passes;
  const knockoutTotal = kp.r32 + kp.r16 + kp.qf + kp.sf + kp.third + kp.final;
  const total = groupTotal + knockoutTotal;

  return {
    groupPositions,
    groupPerfectBonus,
    bestThirds,
    passes,
    ...kp,
    groupTotal,
    knockoutTotal,
    total,
  };
}

export function computeLeaderboard(
  participants: Participant[],
  results: Results,
  groups: Group[],
  matches: MatchesData,
): LeaderboardEntry[] {
  const temporalSnapshot = buildTemporalSnapshot(groups, results, matches);

  const entries: LeaderboardEntry[] = participants.map((p) => ({
    participant: p,
    score: computeScore(p, results, 'consolidated'),
    temporalScore: computeScore(p, results, 'temporal', temporalSnapshot),
    rank: 0,
    temporalRank: 0,
  }));

  const byConsolidated = [...entries].sort((a, b) => b.score.total - a.score.total);
  let rank = 1;
  byConsolidated.forEach((entry, i) => {
    if (i > 0 && entry.score.total < byConsolidated[i - 1].score.total) rank = i + 1;
    entry.rank = rank;
  });

  const byTemporal = [...entries].sort((a, b) => b.temporalScore.total - a.temporalScore.total);
  rank = 1;
  byTemporal.forEach((entry, i) => {
    if (i > 0 && entry.temporalScore.total < byTemporal[i - 1].temporalScore.total) rank = i + 1;
    entry.temporalRank = rank;
  });

  return byConsolidated;
}

export function scoreGroupForMode(
  predicted: string[],
  state: EffectiveGroupResult,
  mode: ScoreMode,
): { points: number; perfectBonus: boolean } {
  if (!groupCountsForMode(state, mode)) {
    return { points: 0, perfectBonus: false };
  }

  const scored = scoreGroupFromStandings(predicted, state.standings);
  return {
    points: scored.groupPositions + scored.groupPerfectBonus,
    perfectBonus: scored.groupPerfectBonus > 0,
  };
}
