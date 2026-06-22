import { Link } from "react-router-dom";
import type { KnockoutMatch, Participant, Team } from "../../types";
import { ROUND_POINTS } from "../../utils/scoring";
import { buildTeamMap } from "../../utils/teamIds";
import { formatParticipantNameText } from "../participant/ParticipantName";
import { FlagIcon } from "../FlagIcon";

interface BracketMatchProps {
  match: KnockoutMatch;
  participants: Participant[];
  teams: Team[];
}

export function BracketMatch({
  match,
  participants,
  teams,
}: BracketMatchProps) {
  const teamMap = buildTeamMap(teams);

  const homeTeam = match.homeTeam ? teamMap[match.homeTeam] : null;
  const awayTeam = match.awayTeam ? teamMap[match.awayTeam] : null;
  const winnerTeam = match.winner ? teamMap[match.winner] : null;

  const pts = ROUND_POINTS[match.round];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Match teams */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
        {homeTeam && awayTeam ? (
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 text-sm">
            <div
              className={`flex items-center gap-2 min-w-0 ${match.winner === homeTeam.id ? "text-indigo-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}
            >
              <FlagIcon countryCode={homeTeam.countryCode} />
              <span className="font-medium truncate">{homeTeam.name}</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-xs font-bold sm:px-1">
              vs
            </span>
            <div
              className={`flex items-center gap-2 min-w-0 sm:flex-1 sm:justify-end ${match.winner === awayTeam.id ? "text-indigo-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}
            >
              <span className="font-medium truncate sm:text-right">
                {awayTeam.name}
              </span>
              <FlagIcon countryCode={awayTeam.countryCode} />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-0.5">
            Por determinar
          </div>
        )}

        {match.completed && winnerTeam && (
          <div className="text-center mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Ganador:{" "}
            <span className="font-semibold text-indigo-600 dark:text-blue-400">
              <FlagIcon countryCode={winnerTeam.countryCode} />{" "}
              {winnerTeam.name}
            </span>
          </div>
        )}
      </div>

      {/* Participant predictions */}
      <div className="px-3 py-2 flex flex-wrap gap-1.5">
        {participants.map((p) => {
          const predicted = p.knockoutPredictions[match.id];
          if (!predicted) return null;
          const predictedTeam = teamMap[predicted];
          const isCorrect = match.completed && match.winner === predicted;
          const isWrong = match.completed && match.winner !== predicted;

          return (
            <Link
              key={p.id}
              to={`/participante/${p.id}`}
              title={`${formatParticipantNameText(p.name)}: ${predictedTeam?.name ?? predicted}`}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 ${
                !match.completed
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  : isCorrect
                    ? "bg-indigo-50 dark:bg-blue-900/50 text-indigo-700 dark:text-blue-200"
                    : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.color }}
              />
              {predictedTeam && (
                <FlagIcon countryCode={predictedTeam.countryCode} />
              )}
              <span>{predictedTeam?.name ?? predicted}</span>
              {isCorrect && <span>✅ +{pts}</span>}
              {isWrong && <span>❌</span>}
            </Link>
          );
        })}
        {participants.every((p) => !p.knockoutPredictions[match.id]) && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Sin predicciones aún
          </span>
        )}
      </div>
    </div>
  );
}
