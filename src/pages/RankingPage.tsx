import { useData } from "../hooks/useData";
import { computeLeaderboard, MAX_SCORE } from "../utils/scoring";
import { Podium, RankingTable } from "../components/ranking/RankingComponents";

export function RankingPage() {
  const { participants, results, groups, matches, loading, error } = useData();

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

  const leaderboard = computeLeaderboard(participants, results, groups, matches);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Clasificación
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fase actual:{" "}
            <span className="font-medium capitalize text-indigo-600 dark:text-blue-400">
              {results.phase === "groups"
                ? "Fase de grupos"
                : results.phase === "knockout"
                  ? "Fase eliminatoria"
                  : "Torneo finalizado"}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            <span className="text-indigo-600 dark:text-blue-400">Consolidado</span>
            {" = grupos cerrados · "}
            <span className="text-amber-600 dark:text-amber-400">Temporal</span>
            {" = tras 1ª jornada completa"}
            <span className="hidden sm:inline">
              {" · "}
              Ranking ordenado por consolidado + temporal
            </span>
          </p>
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500 shrink-0">
          Máx. posible:{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {MAX_SCORE.total} pts
          </span>
          <br />
          Actualizado:{" "}
          <span className="font-medium">
            {results.lastUpdated
              ? new Date(results.lastUpdated).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        </div>
      </div>

      <Podium entries={leaderboard} />
      <RankingTable entries={leaderboard} />
    </div>
  );
}
