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
    Promise.all([
      fetch(`${BASE}data/teams.json`).then((r) => r.json()),
      fetch(`${BASE}data/groups.json`).then((r) => r.json()),
      fetch(`${BASE}data/predictions.json`).then((r) => r.json()),
      fetch(`${BASE}data/results.json`).then((r) => r.json()),
      fetch(`${BASE}data/matches.json`).then((r) => r.json()),
    ])
      .then(([teams, groups, predictions, results, matches]) => {
        setData({
          teams,
          groups,
          participants: predictions.participants,
          results,
          matches,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error loading data',
        }));
      });
  }, []);

  return data;
}
