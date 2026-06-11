#!/usr/bin/env node
// Fetches World Cup 2026 results from football-data.org and writes results.json
// Requires env var: FOOTBALL_API_KEY
// Register free at: https://www.football-data.org/

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FOOTBALL_API_KEY;
const RESULTS_PATH = path.join(__dirname, '..', 'public', 'data', 'results.json');
const MATCHES_PATH = path.join(__dirname, '..', 'public', 'data', 'matches.json');

// WC 2026 competition ID in football-data.org (update if needed)
const COMPETITION_ID = 'WC';

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(new Error('Request timeout')); });
  });
}

async function main() {
  if (!API_KEY) {
    console.log('No FOOTBALL_API_KEY set. Skipping results update.');
    process.exit(0);
  }

  const headers = { 'X-Auth-Token': API_KEY };

  let matches;
  try {
    const data = await fetchJson(
      `https://api.football-data.org/v4/competitions/${COMPETITION_ID}/matches`,
      headers
    );
    matches = data.matches;
  } catch (err) {
    console.error('Failed to fetch matches:', err.message);
    process.exit(1);
  }

  // Load current results
  const current = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

  // Determine phase
  const hasKnockout = matches.some(
    (m) => m.stage !== 'GROUP_STAGE' && m.status === 'FINISHED'
  );
  const allGroupsFinished = matches
    .filter((m) => m.stage === 'GROUP_STAGE')
    .every((m) => m.status === 'FINISHED');

  current.phase = hasKnockout
    ? 'knockout'
    : allGroupsFinished
    ? 'knockout'
    : 'groups';

  // Update group standings from finished group matches
  // football-data.org provides standings via a separate endpoint
  try {
    const standingsData = await fetchJson(
      `https://api.football-data.org/v4/competitions/${COMPETITION_ID}/standings`,
      headers
    );
    for (const standing of standingsData.standings ?? []) {
      const group = standing.group?.replace('GROUP_', '');
      if (!group || !current.groupResults[group]) continue;
      current.groupResults[group].standings = standing.table.map((row) => {
        // Map team name to our teamId — best effort by team short name
        return row.team.tla ?? row.team.shortName;
      });
      current.groupResults[group].completed = standing.table.every(
        (row) => row.playedGames >= 3
      );
    }
  } catch (err) {
    console.warn('Could not fetch standings:', err.message);
  }

  // Update knockout matches
  const stageMap = {
    'LAST_32': 'r32',
    'LAST_16': 'r16',
    'QUARTER_FINALS': 'qf',
    'SEMI_FINALS': 'sf',
    'THIRD_PLACE': 'third',
    'FINAL': 'final',
  };

  const knockoutMatches = matches.filter((m) => stageMap[m.stage]);

  // Sort by date and assign to our sequential IDs
  const byRound = {};
  for (const m of knockoutMatches) {
    const round = stageMap[m.stage];
    if (!byRound[round]) byRound[round] = [];
    byRound[round].push(m);
  }

  for (const round of Object.keys(byRound)) {
    byRound[round].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    byRound[round].forEach((m, i) => {
      const matchId = `${round === 'third' || round === 'final' ? round : round}_m${i + 1}`;
      const existing = current.knockoutMatches.find((km) => km.id === matchId);
      if (!existing) return;
      existing.homeTeam = m.homeTeam?.tla ?? null;
      existing.awayTeam = m.awayTeam?.tla ?? null;
      existing.completed = m.status === 'FINISHED';
      existing.winner = m.status === 'FINISHED'
        ? (m.score.winner === 'HOME_TEAM' ? m.homeTeam?.tla : m.awayTeam?.tla)
        : null;
    });
  }

  current.lastUpdated = new Date().toISOString();

  const matchesData = {
    matches: matches.map((m) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      stage: m.stage,
      group: m.group?.replace('GROUP_', '') ?? null,
      homeTeam: m.homeTeam?.tla ?? null,
      awayTeam: m.awayTeam?.tla ?? null,
      homeScore:
        m.score?.fullTime?.home ??
        m.score?.regularTime?.home ??
        m.score?.halfTime?.home ??
        null,
      awayScore:
        m.score?.fullTime?.away ??
        m.score?.regularTime?.away ??
        m.score?.halfTime?.away ??
        null,
    })),
    lastUpdated: current.lastUpdated,
  };

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(current, null, 2));
  fs.writeFileSync(MATCHES_PATH, JSON.stringify(matchesData, null, 2));
  console.log('results.json and matches.json updated at', current.lastUpdated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
