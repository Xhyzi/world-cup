import { useData } from "../hooks/useData";
import { BracketMatch } from "../components/knockout/BracketMatch";
import { ParticipantName } from "../components/participant/ParticipantName";
import type { RoundKey } from "../types";
import { ROUND_POINTS } from "../utils/scoring";
import { resolveEffectiveResults } from "../utils/standings";
import { isKnockoutPhase } from "../utils/phase";

const ROUND_LABELS: Record<RoundKey, string> = {
  r32: "Dieciseisavos de final",
  r16: "Octavos de final",
  qf: "Cuartos de final",
  sf: "Semifinales",
  third: "Tercer y cuarto puesto",
  final: "Final",
};

const ROUND_ORDER: RoundKey[] = ["r32", "r16", "qf", "sf", "third", "final"];

export function KnockoutPage() {
  const { participants, results, teams, groups, matches, loading, error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-red-700 dark:text-red-400">
          Error cargando datos: {error}
        </div>
      </div>
    );
  }

  const effectiveResults = resolveEffectiveResults(groups, results, matches);

  if (!isKnockoutPhase(effectiveResults, participants)) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Fase Eliminatoria
        </h1>
        <div className="bg-indigo-50 dark:bg-blue-900/20 border border-indigo-100 dark:border-blue-700 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-indigo-700 dark:text-blue-200 mb-2">
            La fase eliminatoria aún no ha comenzado
          </h2>
          <p className="text-indigo-600 dark:text-blue-400">
            Primero debe completarse la fase de grupos. Las predicciones de cada
            participante se añadirán al comenzar esta fase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Fase Eliminatoria
        </h1>

        {/* Participant legend */}
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                <ParticipantName name={p.name} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {ROUND_ORDER.map((round) => {
          const matches = effectiveResults.knockoutMatches.filter(
            (m) => m.round === round,
          );
          if (matches.length === 0) return null;

          const completedCount = matches.filter((m) => m.completed).length;

          return (
            <section key={round}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {ROUND_LABELS[round]}
                </h2>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full w-fit">
                  {ROUND_POINTS[round]} pts por acierto
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 sm:ml-auto">
                  {completedCount}/{matches.length} jugados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {matches.map((match) => (
                  <BracketMatch
                    key={match.id}
                    match={match}
                    participants={participants}
                    teams={teams}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
