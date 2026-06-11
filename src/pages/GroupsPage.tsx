import { useData } from "../hooks/useData";
import { GroupCard } from "../components/groups/GroupCard";

export function GroupsPage() {
  const { groups, participants, results, teams, loading, error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-red-700 dark:text-red-400">
          Error cargando datos: {error}
        </div>
      </div>
    );
  }

  const completedGroups = groups.filter(
    (g) => results.groupResults[g.id]?.completed,
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fase de Grupos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {completedGroups} de {groups.length} grupos completados
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-indigo-100 dark:bg-blue-800 inline-block" />
            Posición exacta
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-800 inline-block" />
            Pasa (posición no exacta)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-200 dark:bg-red-800 inline-block" />
            Fallo
          </span>
        </div>
      </div>

      {/* Participant legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {p.name}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            participants={participants}
            results={results}
            teams={teams}
          />
        ))}
      </div>
    </div>
  );
}
