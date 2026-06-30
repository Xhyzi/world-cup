#!/usr/bin/env node
// Recomputes group standings, best thirds, and phase from matches.json.
// Use when results.json is stale or the API standings endpoint failed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncGroupResultsFromMatches } from './standings-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RESULTS_PATH = path.join(__dirname, '..', 'public', 'data', 'results.json');
const MATCHES_PATH = path.join(__dirname, '..', 'public', 'data', 'matches.json');
const GROUPS_PATH = path.join(__dirname, '..', 'public', 'data', 'groups.json');

const current = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
const matchesData = JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8'));
const groups = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'));

syncGroupResultsFromMatches(current, groups, matchesData.matches);

const lastUpdated = new Date().toISOString();
current.lastUpdated = lastUpdated;

fs.writeFileSync(RESULTS_PATH, JSON.stringify(current, null, 2));

const completed = Object.values(current.groupResults).filter((g) => g.completed).length;
console.log(
  `results.json updated: ${completed}/${groups.length} groups complete, ` +
    `${current.bestThirds.length} best thirds, phase=${current.phase}`,
);
