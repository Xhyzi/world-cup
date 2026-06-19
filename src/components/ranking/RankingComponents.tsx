import { Link } from "react-router-dom";
import type { LeaderboardEntry } from "../../types";
import { MAX_SCORE } from "../../utils/scoring";
import { ParticipantAvatar } from "../ParticipantAvatar";

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = [
  "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700",
  "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
  "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
];

interface PodiumProps {
  entries: LeaderboardEntry[];
}

export function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {top3.map((entry, i) => (
        <Link
          key={entry.participant.id}
          to={`/participante/${entry.participant.id}`}
          className={`rounded-xl border-2 p-5 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow ${RANK_COLORS[i] ?? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
        >
          <span className="text-4xl">{MEDALS[i]}</span>
          <ParticipantAvatar
            participantId={entry.participant.id}
            color={entry.participant.color}
            size="md"
          />
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-center">
            {entry.participant.name}
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-blue-400">
            {entry.combinedScore.total}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {entry.score.total} cons. · {entry.temporalScore.total} temp.
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            de {MAX_SCORE.total} pts
          </span>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{
                width: `${(entry.combinedScore.total / MAX_SCORE.total) * 100}%`,
              }}
            />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
            <div
              className="h-1.5 rounded-full bg-amber-500"
              style={{
                width: `${(entry.temporalScore.total / MAX_SCORE.total) * 100}%`,
              }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

interface RankingTableProps {
  entries: LeaderboardEntry[];
}

export function RankingTable({ entries }: RankingTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-indigo-700 dark:bg-gray-700 text-white text-left">
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Participante</th>
              <th className="px-4 py-3 text-right">Grupos</th>
              <th className="px-4 py-3 text-right">Eliminatoria</th>
              <th className="px-4 py-3 text-right font-bold">Consolidado</th>
              <th className="px-4 py-3 text-right font-bold">Temporal</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">
                Progreso
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.participant.id}
                className={`border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/50"
                }`}
              >
                <td className="px-4 py-3 text-center">
                  {MEDALS[i] ?? <span className="text-gray-400">🏅</span>}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/participante/${entry.participant.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <ParticipantAvatar
                      participantId={entry.participant.id}
                      color={entry.participant.color}
                      size="sm"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.participant.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                  {entry.score.groupTotal}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                    /{MAX_SCORE.groupTotal}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                  {entry.score.knockoutTotal}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                    /{MAX_SCORE.knockoutTotal}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-blue-400 text-base">
                  {entry.score.total}
                  {entry.consolidatedRank !== entry.rank && (
                    <span className="block text-xs font-normal text-gray-400 dark:text-gray-500">
                      #{entry.consolidatedRank} solo cons.
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-400 text-base">
                  {entry.temporalScore.total}
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${(entry.combinedScore.total / MAX_SCORE.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                        {Math.round((entry.combinedScore.total / MAX_SCORE.total) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-amber-500"
                          style={{
                            width: `${(entry.temporalScore.total / MAX_SCORE.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-amber-600 dark:text-amber-400 w-8 text-right">
                        {Math.round(
                          (entry.temporalScore.total / MAX_SCORE.total) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
