import type { Participant, Results, ScoreBreakdown, LeaderboardEntry, RoundKey } from '../types';

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

/** 4 pts per correct position, +10 bonus if all 4 correct */
export function scoreGroupPositions(predicted: string[], actual: string[]): number {
  if (actual.length < 4) return 0;
  let pts = 0;
  let allCorrect = true;
  for (let i = 0; i < 4; i++) {
    if (predicted[i] === actual[i]) {
      pts += 4;
    } else {
      allCorrect = false;
    }
  }
  if (allCorrect) pts += 10;
  return pts;
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
export function scorePasses(participant: Participant, results: Results): number {
  const qualifiers = new Set<string>();
  for (const groupId of Object.keys(results.groupResults)) {
    const gr = results.groupResults[groupId];
    if (gr.standings.length >= 2) {
      qualifiers.add(gr.standings[0]);
      qualifiers.add(gr.standings[1]);
    }
  }
  results.bestThirds.forEach((t) => qualifiers.add(t));

  if (qualifiers.size === 0) return 0;

  let pts = 0;
  // Predicted qualifiers = top 2 of each predicted group + predicted best thirds
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

export function computeScore(participant: Participant, results: Results): ScoreBreakdown {
  let groupPositions = 0;
  let groupPerfectBonus = 0;

  for (const groupId of Object.keys(results.groupResults)) {
    const gr = results.groupResults[groupId];
    if (gr.standings.length < 4) continue;
    const pred = participant.groupPredictions[groupId] ?? [];
    let positionPts = 0;
    let allCorrect = true;
    for (let i = 0; i < 4; i++) {
      if (pred[i] === gr.standings[i]) {
        positionPts += 4;
      } else {
        allCorrect = false;
      }
    }
    groupPositions += positionPts;
    if (allCorrect) groupPerfectBonus += 10;
  }

  const bestThirds = scoreBestThirds(participant.bestThirdPredictions, results.bestThirds);
  const passes = scorePasses(participant, results);
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
  results: Results
): LeaderboardEntry[] {
  const entries = participants.map((p) => ({
    participant: p,
    score: computeScore(p, results),
    rank: 0,
  }));

  entries.sort((a, b) => b.score.total - a.score.total);

  let rank = 1;
  entries.forEach((entry, i) => {
    if (i > 0 && entry.score.total < entries[i - 1].score.total) rank = i + 1;
    entry.rank = rank;
  });

  return entries;
}
