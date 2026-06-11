import { Link } from "react-router-dom";
import type { Group, Participant, Results, Team } from "../../types";
import { FlagIcon } from "../FlagIcon";

interface GroupCardProps {
  group: Group;
  participants: Participant[];
  results: Results;
  teams: Team[];
}

export function GroupCard({
  group,
  participants,
  results,
  teams,
}: GroupCardProps) {
  const gr = results.groupResults[group.id] ?? {
    standings: [],
    completed: false,
  };
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  const displayTeams =
    gr.completed && gr.standings.length > 0 ? gr.standings : group.teamIds;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-700 dark:bg-gray-700 px-4 py-2.5 flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">{group.name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            gr.completed
              ? "bg-indigo-500 text-white"
              : "bg-white/20 text-white/80"
          }`}
        >
          {gr.completed ? "Completado" : "Por jugar"}
        </span>
      </div>

      {/* Teams */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {displayTeams.map((teamId, pos) => {
          const team = teamMap[teamId];
          if (!team) return null;
          return (
            <div key={teamId} className="px-4 py-2.5">
              {/* Team row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-400 dark:text-gray-500 w-4">
                  {pos + 1}.
                </span>
                <FlagIcon countryCode={team.countryCode} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                  {team.name}
                </span>
                {pos < 2 && (
                  <span className="text-xs bg-indigo-50 dark:bg-blue-900/40 text-indigo-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                    ✓ Pasa
                  </span>
                )}
              </div>

              {/* Participant prediction badges */}
              <div className="flex gap-1.5 flex-wrap pl-6">
                {participants.map((p) => {
                  const pred = p.groupPredictions[group.id] ?? [];
                  const predictedPos = pred.indexOf(teamId);
                  const isCorrect = gr.completed && predictedPos === pos;
                  const isPasses =
                    gr.completed &&
                    pos < 2 &&
                    predictedPos >= 0 &&
                    predictedPos < 2 &&
                    predictedPos !== pos;
                  const isPending = !gr.completed;

                  return (
                    <Link
                      key={p.id}
                      to={`/participante/${p.id}`}
                      title={`${p.name}: predijo ${predictedPos + 1}º`}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-opacity hover:opacity-80 ${
                        isPending
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                          : isCorrect
                            ? "bg-indigo-50 dark:bg-blue-900/60 text-indigo-700 dark:text-blue-200"
                            : isPasses
                              ? "bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200"
                              : "bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      {predictedPos >= 0 ? `${predictedPos + 1}º` : "—"}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
