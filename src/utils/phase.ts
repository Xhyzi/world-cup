import type { Participant, Results } from '../types';

export function hasKnockoutPredictions(
  predictions: Record<string, string> | undefined,
): boolean {
  return Object.keys(predictions ?? {}).length > 0;
}

export function anyParticipantHasKnockoutPredictions(
  participants: Participant[],
): boolean {
  return participants.some((p) => hasKnockoutPredictions(p.knockoutPredictions));
}

export function hasKnockoutStarted(results: Results): boolean {
  return results.knockoutMatches.some(
    (match) => match.completed || match.homeTeam !== null,
  );
}

export function isKnockoutPhase(
  results: Results,
  participants: Participant[] = [],
): boolean {
  return (
    results.phase === 'knockout' ||
    results.phase === 'finished' ||
    hasKnockoutStarted(results) ||
    anyParticipantHasKnockoutPredictions(participants)
  );
}
