export interface Team {
  id: string;
  name: string;
  countryCode: string;
  group: string;
}

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

export type RoundKey = 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';

export interface Participant {
  id: string;
  name: string;
  color: string;
  groupPredictions: Record<string, string[]>;
  bestThirdPredictions: string[];
  knockoutPredictions: Record<string, string>;
}

export interface GroupResult {
  standings: string[];
  completed: boolean;
}

export interface KnockoutMatch {
  id: string;
  round: RoundKey;
  homeTeam: string | null;
  awayTeam: string | null;
  winner: string | null;
  completed: boolean;
}

export interface Results {
  phase: 'groups' | 'knockout' | 'finished';
  groupResults: Record<string, GroupResult>;
  bestThirds: string[];
  knockoutMatches: KnockoutMatch[];
  lastUpdated: string;
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface FixtureMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  stage: string;
  group: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface MatchesData {
  matches: FixtureMatch[];
  lastUpdated: string;
}

export interface ScoreBreakdown {
  groupPositions: number;
  groupPerfectBonus: number;
  bestThirds: number;
  passes: number;
  r32: number;
  r16: number;
  qf: number;
  sf: number;
  third: number;
  final: number;
  total: number;
  groupTotal: number;
  knockoutTotal: number;
}

export interface LeaderboardEntry {
  participant: Participant;
  score: ScoreBreakdown;
  rank: number;
}
