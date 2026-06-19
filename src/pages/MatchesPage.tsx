import { useMemo } from "react";
import { useData } from "../hooks/useData";
import { MatchCard } from "../components/matches/MatchCard";
import type { FixtureMatch } from "../types";
import { formatLastUpdated, formatMatchDate } from "../utils/dates";

const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED"]);
const UPCOMING_STATUSES = new Set(["SCHEDULED", "TIMED"]);
const RESULTS_LIMIT = 15;
const UPCOMING_LIMIT = 15;

function groupByDate(matches: FixtureMatch[]): [string, FixtureMatch[]][] {
  const groups = new Map<string, FixtureMatch[]>();
  for (const match of matches) {
    const dateKey = formatMatchDate(match.utcDate);
    const existing = groups.get(dateKey) ?? [];
    existing.push(match);
    groups.set(dateKey, existing);
  }
  return Array.from(groups.entries());
}

function MatchSection({
  title,
  matches,
  teams,
  emptyMessage,
}: {
  title: string;
  matches: FixtureMatch[];
  teams: ReturnType<typeof useData>["teams"];
  emptyMessage: string;
}) {
  if (matches.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      </section>
    );
  }

  const grouped = groupByDate(matches);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h2>
      <div className="space-y-5">
        {grouped.map(([date, dayMatches]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 capitalize">
              {date}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dayMatches.map((match) => (
                <MatchCard key={match.id} match={match} teams={teams} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MatchesPage() {
  const { teams, matches, loading, error } = useData();

  const { live, upcoming, recent } = useMemo(() => {
    const all = matches.matches;
    return {
      live: all
        .filter((m) => LIVE_STATUSES.has(m.status))
        .sort(
          (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
        ),
      upcoming: all
        .filter((m) => UPCOMING_STATUSES.has(m.status))
        .sort(
          (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
        )
        .slice(0, UPCOMING_LIMIT),
      recent: all
        .filter((m) => m.status === "FINISHED")
        .sort(
          (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime(),
        )
        .slice(0, RESULTS_LIMIT),
    };
  }, [matches.matches]);

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

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Partidos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fechas y horas en hora de España (Europe/Madrid)
          </p>
        </div>
        {matches.lastUpdated && (
          <div className="text-right text-sm text-gray-400 dark:text-gray-500">
            Actualizado:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatLastUpdated(matches.lastUpdated)}
            </span>
          </div>
        )}
      </div>

      {live.length > 0 && (
        <MatchSection
          title="En directo"
          matches={live}
          teams={teams}
          emptyMessage=""
        />
      )}

      <MatchSection
        title="Próximos partidos"
        matches={upcoming}
        teams={teams}
        emptyMessage="No hay partidos programados por ahora."
      />

      <MatchSection
        title="Últimos resultados"
        matches={recent}
        teams={teams}
        emptyMessage="Aún no hay resultados disponibles."
      />
    </div>
  );
}
