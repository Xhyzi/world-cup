import type { FixtureMatch, Team } from "../../types";
import { FlagIcon } from "../FlagIcon";
import { formatMatchTime } from "../../utils/dates";
import { buildTeamMap } from "../../utils/teamIds";

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  LAST_32: "Dieciseisavos",
  LAST_16: "Octavos",
  QUARTER_FINALS: "Cuartos",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

interface MatchCardProps {
  match: FixtureMatch;
  teams: Team[];
  showTime?: boolean;
}

export function MatchCard({ match, teams, showTime = true }: MatchCardProps) {
  const teamMap = buildTeamMap(teams);
  const homeTeam = match.homeTeam ? teamMap[match.homeTeam] : null;
  const awayTeam = match.awayTeam ? teamMap[match.awayTeam] : null;

  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const hasScore =
    isFinished || isLive
      ? match.homeScore !== null && match.awayScore !== null
      : false;

  const stageLabel =
    match.stage === "GROUP_STAGE" && match.group
      ? `Grupo ${match.group}`
      : (STAGE_LABELS[match.stage] ?? match.stage);

  const homeWins =
    hasScore && match.homeScore !== null && match.awayScore !== null
      ? match.homeScore > match.awayScore
      : false;
  const awayWins =
    hasScore && match.homeScore !== null && match.awayScore !== null
      ? match.awayScore > match.homeScore
      : false;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {stageLabel}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              En directo
            </span>
          )}
          {showTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {formatMatchTime(match.utcDate)}
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        {homeTeam && awayTeam ? (
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 flex items-center gap-2 min-w-0 ${homeWins ? "font-bold text-indigo-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              <FlagIcon countryCode={homeTeam.countryCode} />
              <span className="truncate text-sm">{homeTeam.name}</span>
            </div>

            <div className="flex-shrink-0 text-center min-w-[3.5rem]">
              {hasScore ? (
                <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                  {match.homeScore} – {match.awayScore}
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                  vs
                </span>
              )}
            </div>

            <div
              className={`flex-1 flex items-center justify-end gap-2 min-w-0 ${awayWins ? "font-bold text-indigo-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              <span className="truncate text-sm text-right">
                {awayTeam.name}
              </span>
              <FlagIcon countryCode={awayTeam.countryCode} />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-1">
            Por determinar
          </div>
        )}
      </div>
    </div>
  );
}
