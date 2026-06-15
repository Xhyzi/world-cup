import type { Participant, Results, Team } from "../../types";
import { FlagIcon } from "../FlagIcon";

interface GroupPredictionCardProps {
  groupId: string;
  groupName: string;
  predicted: string[];
  actual: string[];
  completed: boolean;
  teams: Team[];
  points: number;
  perfectBonus: boolean;
  temporalPoints?: number;
  temporalPerfectBonus?: boolean;
}

function getTeamName(id: string, teams: Team[]): string {
  return teams.find((t) => t.id === id)?.name ?? id;
}

type PositionStatus = "correct" | "passes" | "wrong" | "pending";

function getPositionStatus(
  predictedTeam: string,
  position: number,
  actual: string[],
  completed: boolean,
  useCurrentStandings = false,
): PositionStatus {
  const hasStandings = actual.length >= 4;
  if (!hasStandings) return "pending";
  if (!completed && !useCurrentStandings) return "pending";
  if (predictedTeam === actual[position]) return "correct";
  if (actual.slice(0, 2).includes(predictedTeam)) return "passes";
  return "wrong";
}

const STATUS_CLASSES: Record<PositionStatus, string> = {
  correct:
    "bg-indigo-50 dark:bg-blue-900/40 border-indigo-200 dark:border-blue-700 text-indigo-700 dark:text-blue-200",
  passes:
    "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
  wrong:
    "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200",
  pending:
    "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400",
};

const STATUS_ICON: Record<PositionStatus, string> = {
  correct: "✅",
  passes: "🟡",
  wrong: "❌",
  pending: "⏳",
};

export function GroupPredictionCard({
  groupId,
  groupName,
  predicted,
  actual,
  completed,
  teams,
  points,
  perfectBonus,
  temporalPoints = 0,
  temporalPerfectBonus = false,
}: GroupPredictionCardProps) {
  const hasCurrentStandings = actual.length >= 4;
  const showTemporal = !completed && hasCurrentStandings;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">
          {groupName}
        </h3>
        <div className="flex items-center gap-2">
          {(perfectBonus || temporalPerfectBonus) && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full font-medium">
              ⭐ Perfecto{temporalPerfectBonus && !completed ? " (temp.)" : ""}
            </span>
          )}
          {completed && (
            <span className="text-sm font-bold text-indigo-600 dark:text-blue-400">
              +{points} pts
            </span>
          )}
          {showTemporal && (
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              +{temporalPoints} temp.
            </span>
          )}
          {!completed && !hasCurrentStandings && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              En juego
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {[0, 1, 2, 3].map((pos) => {
          const predictedTeam = predicted[pos];
          const status = getPositionStatus(
            predictedTeam,
            pos,
            actual,
            completed,
            showTemporal,
          );
          const team = teams.find((t) => t.id === predictedTeam);
          return (
            <div
              key={`${groupId}-${pos}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${STATUS_CLASSES[status]}`}
            >
              <span className="text-xs font-bold w-4 text-center">
                {pos + 1}.
              </span>
              {team && <FlagIcon countryCode={team.countryCode} />}
              <span className="flex-1 font-medium">
                {getTeamName(predictedTeam, teams)}
              </span>
              <span>{STATUS_ICON[status]}</span>
            </div>
          );
        })}
      </div>

      {(completed || showTemporal) && actual.length >= 4 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
            {completed ? "Resultado real:" : "Clasificación actual:"}
          </p>
          <div className="flex flex-wrap gap-1">
            {actual.map((teamId, i) => {
              const team = teams.find((t) => t.id === teamId);
              return (
                <span
                  key={teamId}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {i + 1}. {team && <FlagIcon countryCode={team.countryCode} />}{" "}
                  {getTeamName(teamId, teams)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface BestThirdsPanelProps {
  predicted: string[];
  actual: string[];
  teams: Team[];
  points: number;
}

export function BestThirdsPanel({
  predicted,
  actual,
  teams,
  points,
}: BestThirdsPanelProps) {
  const hasResults = actual.length > 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Mejores Terceros
        </h2>
        {hasResults && (
          <span className="text-sm font-bold text-indigo-600 dark:text-blue-400">
            +{points} pts
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {predicted.map((teamId) => {
          const isCorrect = hasResults && actual.includes(teamId);
          const isPending = !hasResults;
          const team = teams.find((t) => t.id === teamId);
          return (
            <div
              key={teamId}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${
                isPending
                  ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  : isCorrect
                    ? "bg-indigo-50 dark:bg-blue-900/40 border-indigo-200 dark:border-blue-700 text-indigo-700 dark:text-blue-200"
                    : "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
              }`}
            >
              {team && <FlagIcon countryCode={team.countryCode} />}
              <span className="flex-1">{getTeamName(teamId, teams)}</span>
              <span>{isPending ? "⏳" : isCorrect ? "✅" : "❌"}</span>
            </div>
          );
        })}
      </div>
      {!hasResults && (
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
          Los mejores terceros se determinarán al finalizar la fase de grupos.
        </p>
      )}
    </div>
  );
}

const ROUND_LABELS: Record<string, string> = {
  r32: "Dieciseisavos de final",
  r16: "Octavos de final",
  qf: "Cuartos de final",
  sf: "Semifinales",
  third: "Tercer y cuarto puesto",
  final: "Final",
};

const ROUND_PTS: Record<string, number> = {
  r32: 5,
  r16: 10,
  qf: 25,
  sf: 50,
  third: 50,
  final: 150,
};

interface KnockoutPredictionsProps {
  participant: Participant;
  results: Results;
  teams: Team[];
}

export function KnockoutPredictions({
  participant,
  results,
  teams,
}: KnockoutPredictionsProps) {
  const rounds = ["r32", "r16", "qf", "sf", "third", "final"];
  const hasKnockout = Object.keys(participant.knockoutPredictions).length > 0;

  if (!hasKnockout) {
    return (
      <div className="bg-indigo-50 dark:bg-blue-900/20 border border-indigo-100 dark:border-blue-700 rounded-xl p-6 text-center">
        <p className="text-indigo-700 dark:text-blue-300 font-medium">
          Las predicciones de la fase eliminatoria se añadirán cuando empiece
          esa fase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const matches = results.knockoutMatches.filter(
          (m) => m.round === round,
        );
        const predictions = matches.filter(
          (m) => participant.knockoutPredictions[m.id],
        );
        if (predictions.length === 0) return null;

        return (
          <div key={round}>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
              {ROUND_LABELS[round]}
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                ({ROUND_PTS[round]} pts por acierto)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matches.map((match) => {
                const predicted = participant.knockoutPredictions[match.id];
                if (!predicted) return null;
                const isPending = !match.completed;
                const isCorrect = match.completed && match.winner === predicted;
                const isWrong = match.completed && match.winner !== predicted;
                const team = teams.find((t) => t.id === predicted);
                const actualTeam = match.winner
                  ? teams.find((t) => t.id === match.winner)
                  : null;

                return (
                  <div
                    key={match.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${
                      isPending
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        : isCorrect
                          ? "bg-indigo-50 dark:bg-blue-900/40 border-indigo-200 dark:border-blue-700"
                          : "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700"
                    }`}
                  >
                    <span>{isPending ? "⏳" : isCorrect ? "✅" : "❌"}</span>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${isCorrect ? "text-indigo-700 dark:text-blue-200" : isWrong ? "text-red-800 dark:text-red-200" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {team && <FlagIcon countryCode={team.countryCode} />}{" "}
                        {getTeamName(predicted, teams)}
                      </div>
                      {isWrong && match.winner && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Ganó:{" "}
                          {actualTeam && (
                            <FlagIcon countryCode={actualTeam.countryCode} />
                          )}{" "}
                          {getTeamName(match.winner, teams)}
                        </div>
                      )}
                    </div>
                    {isCorrect && (
                      <span className="text-xs font-bold text-indigo-600 dark:text-blue-400">
                        +{ROUND_PTS[round]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
