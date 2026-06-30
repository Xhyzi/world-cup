import { useState, useEffect } from 'react';
import type { Team, Group, Participant, Results, MatchesData } from '../types';

interface AppData {
  teams: Team[];
  groups: Group[];
  participants: Participant[];
  results: Results;
  matches: MatchesData;
  loading: boolean;
  error: string | null;
}

const BASE = import.meta.env.BASE_URL;

function normalizeParticipant(raw: Participant): Participant {
  return {
    ...raw,
    groupPredictions: raw.groupPredictions ?? {},
    bestThirdPredictions: raw.bestThirdPredictions ?? [],
    knockoutPredictions: raw.knockoutPredictions ?? {},
  };
}

function fetchJson<T>(path: string, cacheBust: string): Promise<T> {
  const url = cacheBust ? `${path}?v=${encodeURIComponent(cacheBust)}` : path;
  return fetch(url, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error(`Failed to load ${path}`);
    return r.json() as Promise<T>;
  });
}

export function useData(): AppData {
  const [data, setData] = useState<AppData>({
    teams: [],
    groups: [],
    participants: [],
    results: {
      phase: 'groups',
      groupResults: {},
      bestThirds: [],
      knockoutMatches: [],
      lastUpdated: '',
    },
    matches: { matches: [], lastUpdated: '' },
    loading: true,
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      const results = await fetchJson<Results>(`${BASE}data/results.json`, '');
      const cacheBust = results.lastUpdated || String(Date.now());

      const [teams, groups, predictions, matches] = await Promise.all([
        fetchJson<Team[]>(`${BASE}data/teams.json`, cacheBust),
        fetchJson<Group[]>(`${BASE}data/groups.json`, cacheBust),
        fetchJson<{ participants: Participant[] }>(
          `${BASE}data/predictions.json`,
          cacheBust,
        ),
        fetchJson<MatchesData>(`${BASE}data/matches.json`, cacheBust),
      ]);

      setData({
        teams,
        groups,
        participants: predictions.participants.map(normalizeParticipant),
        results,
        matches,
        loading: false,
        error: null,
      });
    };

    load().catch((err: unknown) => {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error loading data',
      }));
    });
  }, []);

  return data;
}
