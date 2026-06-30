/**
 * Knockout slots use a fixed bracket-tree order (r32_m1 vs r32_m2 → r16_m1, etc.).
 * Predictions are keyed by slot id — never reorder slots when syncing from the API.
 */

const STAGE_MAP = {
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  THIRD_PLACE: 'third',
  FINAL: 'final',
};

const ROUND_SLOT_COUNTS = {
  r32: 16,
  r16: 8,
  qf: 4,
  sf: 2,
  third: 1,
  final: 1,
};

const FEEDER_ROUND = {
  r16: 'r32',
  qf: 'r16',
  sf: 'qf',
  final: 'sf',
};

function matchIdForRound(round, index) {
  return `${round}_m${index + 1}`;
}

function teamsEqual(a, b) {
  return a !== null && b !== null && a === b;
}

/** True if API home/away match slot home/away in either orientation. */
export function teamsMatchFixture(homeA, awayA, homeB, awayB) {
  if (homeA === null || awayA === null || homeB === null || awayB === null) {
    return false;
  }
  return (
    (teamsEqual(homeA, homeB) && teamsEqual(awayA, awayB)) ||
    (teamsEqual(homeA, awayB) && teamsEqual(awayA, homeB))
  );
}

function feederSlotIds(round, slotIndex) {
  const prev = FEEDER_ROUND[round];
  if (!prev) return [];
  return [matchIdForRound(prev, slotIndex * 2), matchIdForRound(prev, slotIndex * 2 + 1)];
}

function possibleTeamsFromFeeders(knockoutMatches, feederIds) {
  const teams = new Set();
  for (const id of feederIds) {
    const feeder = knockoutMatches.find((m) => m.id === id);
    if (!feeder) continue;
    if (feeder.winner) {
      teams.add(feeder.winner);
      continue;
    }
    if (feeder.homeTeam) teams.add(feeder.homeTeam);
    if (feeder.awayTeam) teams.add(feeder.awayTeam);
  }
  return teams;
}

function fixtureTeams(home, away) {
  return [home, away].filter(Boolean);
}

function fixtureMatchesFeeders(apiHome, apiAway, knockoutMatches, round, slotIndex) {
  const feederIds = feederSlotIds(round, slotIndex);
  if (feederIds.length === 0) return false;

  const possible = possibleTeamsFromFeeders(knockoutMatches, feederIds);
  const known = fixtureTeams(apiHome, apiAway);
  if (known.length === 0) return false;

  return known.every((team) => possible.has(team));
}

function findSlotByApiMatchId(knockoutMatches, apiId) {
  return knockoutMatches.find((slot) => slot.apiMatchId === apiId);
}

function findSlotByTeams(knockoutMatches, round, apiHome, apiAway) {
  const roundSlots = knockoutMatches.filter((m) => m.round === round);
  return roundSlots.find((slot) =>
    teamsMatchFixture(apiHome, apiAway, slot.homeTeam, slot.awayTeam),
  );
}

function findSlotByFeeders(knockoutMatches, round, apiHome, apiAway) {
  const count = ROUND_SLOT_COUNTS[round] ?? 0;
  for (let i = 0; i < count; i++) {
    if (fixtureMatchesFeeders(apiHome, apiAway, knockoutMatches, round, i)) {
      return knockoutMatches.find((m) => m.id === matchIdForRound(round, i));
    }
  }
  return undefined;
}

function findKnockoutSlot(knockoutMatches, round, apiHome, apiAway, apiId) {
  return (
    findSlotByApiMatchId(knockoutMatches, apiId) ??
    findSlotByTeams(knockoutMatches, round, apiHome, apiAway) ??
    findSlotByFeeders(knockoutMatches, round, apiHome, apiAway)
  );
}

function applyFixtureToSlot(slot, apiHome, apiAway, completed, winner, apiId) {
  slot.homeTeam = apiHome;
  slot.awayTeam = apiAway;
  slot.completed = completed;
  slot.winner = winner;
  slot.apiMatchId = apiId;
}

/**
 * Updates knockout slots in place from API fixtures without changing slot order.
 */
export function syncKnockoutMatchesFromApi(knockoutMatches, apiMatches, normalizeTeamId) {
  const fixtures = apiMatches
    .filter((m) => STAGE_MAP[m.stage])
    .map((m) => ({
      apiId: m.id,
      round: STAGE_MAP[m.stage],
      home: normalizeTeamId(m.homeTeam?.tla),
      away: normalizeTeamId(m.awayTeam?.tla),
      completed: m.status === 'FINISHED',
      winner:
        m.status === 'FINISHED'
          ? normalizeTeamId(
              m.score?.winner === 'HOME_TEAM'
                ? m.homeTeam?.tla
                : m.awayTeam?.tla,
            )
          : null,
    }));

  for (const fixture of fixtures) {
    const slot = findKnockoutSlot(
      knockoutMatches,
      fixture.round,
      fixture.home,
      fixture.away,
      fixture.apiId,
    );
    if (!slot) {
      if (fixture.home !== null || fixture.away !== null) {
        console.warn(
          `No knockout slot for ${fixture.round} fixture ${fixture.apiId} (${fixture.home ?? '?'} vs ${fixture.away ?? '?'})`,
        );
      }
      continue;
    }

    applyFixtureToSlot(
      slot,
      fixture.home,
      fixture.away,
      fixture.completed,
      fixture.winner,
      fixture.apiId,
    );
  }
}

/** Canonical r32 bracket order used for predictions (tree traversal, not kickoff order). */
export const R32_BRACKET_API_IDS = [
  537415, // GER vs PAR
  537416, // FRA vs SWE
  537417, // ZAF vs CAN
  537418, // NED vs MAR
  537419, // POR vs CRO
  537420, // ESP vs AUT
  537421, // USA vs BIH
  537422, // BEL vs SEN
  537423, // BRA vs JPN
  537424, // CIV vs NOR
  537425, // MEX vs ECU
  537426, // ENG vs COD
  537427, // ARG vs CPV
  537428, // AUS vs EGY
  537429, // SUI vs ALG
  537430, // COL vs GHA
];
