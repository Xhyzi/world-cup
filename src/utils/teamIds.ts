import type { Team } from '../types';

/** football-data.org TLA codes that differ from our internal team ids */
export const TEAM_ID_ALIASES: Record<string, string> = {
  RSA: 'ZAF',
  URY: 'URU',
};

export function normalizeTeamId(id: string | null | undefined): string | null {
  if (!id) return null;
  return TEAM_ID_ALIASES[id] ?? id;
}

export function buildTeamMap(teams: Team[]): Record<string, Team> {
  const map = Object.fromEntries(teams.map((t) => [t.id, t]));
  for (const [alias, canonicalId] of Object.entries(TEAM_ID_ALIASES)) {
    const team = map[canonicalId];
    if (team) map[alias] = team;
  }
  return map;
}
