import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../hooks/useData";
import { computeScore, scoreGroupForMode, MAX_SCORE } from "../utils/scoring";
import { resolveGroupStandings, resolveEffectiveResults } from "../utils/standings";
import {
  GroupPredictionCard,
  BestThirdsPanel,
  KnockoutPredictions,
} from "../components/participant/ParticipantComponents";
import { ParticipantName } from "../components/participant/ParticipantName";
import { ParticipantAvatar } from "../components/ParticipantAvatar";

type Tab = "grupos" | "terceros" | "eliminatoria";

export function ParticipantPage() {
  const { id } = useParams<{ id: string }>();
  const { participants, results, teams, groups, matches, loading, error } = useData();
  const [activeTab, setActiveTab] = useState<Tab>("grupos");

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

  const participant = participants.find((p) => p.id === id);
  if (!participant) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-xl p-6">
          Participante no encontrado.{" "}
          <Link to="/" className="underline text-indigo-600 dark:text-blue-400">
            Volver al ranking
          </Link>
        </div>
      </div>
    );
  }

  const effectiveResults = resolveEffectiveResults(groups, results, matches);
  const temporalSnapshot = Object.fromEntries(
    groups.map((group) => [
      group.id,
      resolveGroupStandings(group, effectiveResults, matches),
    ]),
  );

  const score = computeScore(participant, effectiveResults, "consolidated");
  const temporalScore = computeScore(
    participant,
    effectiveResults,
    "temporal",
    temporalSnapshot,
  );
  const combinedScore = computeScore(
    participant,
    effectiveResults,
    "combined",
    temporalSnapshot,
  );
  const rank =
    participants
      .map((p) =>
        computeScore(p, effectiveResults, "combined", temporalSnapshot).total,
      )
      .sort((a, b) => b - a)
      .indexOf(combinedScore.total) + 1;
  const consolidatedRank =
    participants
      .map((p) => computeScore(p, effectiveResults, "consolidated").total)
      .sort((a, b) => b - a)
      .indexOf(score.total) + 1;

  const statsChips = [
    {
      label: "Posiciones",
      value: score.groupPositions,
      max: MAX_SCORE.groupPositions,
      color: "green",
    },
    {
      label: "Bonus grupos",
      value: score.groupPerfectBonus,
      max: MAX_SCORE.groupPerfectBonus,
      color: "yellow",
    },
    {
      label: "Mejores terceros",
      value: score.bestThirds,
      max: MAX_SCORE.bestThirds,
      color: "blue",
    },
    {
      label: "Pases",
      value: score.passes,
      max: MAX_SCORE.passes,
      color: "purple",
    },
    {
      label: "Eliminatoria",
      value: score.knockoutTotal,
      max: MAX_SCORE.knockoutTotal,
      color: "red",
    },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "grupos", label: "Grupos" },
    { key: "terceros", label: "Mejores Terceros" },
    { key: "eliminatoria", label: "Eliminatoria" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-blue-400 mb-5 transition-colors"
      >
        ← Volver al ranking
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <ParticipantAvatar
            participantId={participant.id}
            color={participant.color}
            size="lg"
            rounded="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                <ParticipantName name={participant.name} />
              </h1>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-0.5 rounded-full text-sm font-medium">
                #{rank} de {participants.length}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-2 mt-2">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  Total
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-blue-400">
                  {combinedScore.total}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-lg ml-1">
                  / {MAX_SCORE.total}
                </span>
              </div>
              <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-600 sm:pl-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  Consolidado
                </span>
                <span className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {score.total}
                </span>
                {consolidatedRank !== rank && (
                  <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm ml-1">
                    (#{consolidatedRank})
                  </span>
                )}
              </div>
              <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-600 sm:pl-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  Temporal
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {temporalScore.total}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
              <div
                className="h-2.5 rounded-full bg-indigo-500 transition-all"
                style={{
                  width: `${(combinedScore.total / MAX_SCORE.total) * 100}%`,
                }}
              />
            </div>
            {combinedScore.total !== score.total && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full bg-amber-500 transition-all"
                  style={{
                    width: `${(temporalScore.total / MAX_SCORE.total) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
          {statsChips.map((chip) => (
            <div
              key={chip.label}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {chip.label}
              </div>
              <div className="font-bold text-gray-900 dark:text-white text-lg">
                {chip.value}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                de {chip.max}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="sm:hidden">
              {tab.key === "terceros" ? "Terceros" : tab.label}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "grupos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const stored = effectiveResults.groupResults[group.id] ?? {
              standings: [],
              completed: false,
            };
            const temporal = temporalSnapshot[group.id];
            const predicted = participant.groupPredictions[group.id] ?? [];
            const consolidated = scoreGroupForMode(
              predicted,
              { ...stored, firstRoundComplete: temporal.firstRoundComplete },
              "consolidated",
            );
            const temporalScoreGroup = scoreGroupForMode(
              predicted,
              temporal,
              "temporal",
            );
            return (
              <GroupPredictionCard
                key={group.id}
                groupId={group.id}
                groupName={group.name}
                predicted={predicted}
                actual={temporal.standings}
                completed={stored.completed}
                teams={teams}
                points={consolidated.points}
                perfectBonus={consolidated.perfectBonus}
                temporalPoints={temporalScoreGroup.points}
                temporalPerfectBonus={temporalScoreGroup.perfectBonus}
                hasTemporalStandings={temporal.firstRoundComplete}
              />
            );
          })}
        </div>
      )}

      {activeTab === "terceros" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <BestThirdsPanel
            predicted={participant.bestThirdPredictions}
            actual={effectiveResults.bestThirds}
            teams={teams}
            points={score.bestThirds}
          />
        </div>
      )}

      {activeTab === "eliminatoria" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <KnockoutPredictions
            participant={participant}
            results={results}
            teams={teams}
          />
        </div>
      )}
    </div>
  );
}
