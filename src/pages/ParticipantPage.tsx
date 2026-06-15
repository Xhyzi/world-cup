import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../hooks/useData";
import { computeScore, scoreGroupForMode, MAX_SCORE } from "../utils/scoring";
import {
  GroupPredictionCard,
  BestThirdsPanel,
  KnockoutPredictions,
} from "../components/participant/ParticipantComponents";
import { ParticipantAvatar } from "../components/ParticipantAvatar";

type Tab = "grupos" | "terceros" | "eliminatoria";

export function ParticipantPage() {
  const { id } = useParams<{ id: string }>();
  const { participants, results, teams, groups, loading, error } = useData();
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-red-700 dark:text-red-400">
          Error cargando datos: {error}
        </div>
      </div>
    );
  }

  const participant = participants.find((p) => p.id === id);
  if (!participant) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-xl p-6">
          Participante no encontrado.{" "}
          <Link to="/" className="underline text-indigo-600 dark:text-blue-400">
            Volver al ranking
          </Link>
        </div>
      </div>
    );
  }

  const score = computeScore(participant, results, "consolidated");
  const temporalScore = computeScore(participant, results, "temporal");
  const rank =
    participants
      .map((p) => computeScore(p, results, "consolidated").total)
      .sort((a, b) => b - a)
      .indexOf(score.total) + 1;
  const temporalRank =
    participants
      .map((p) => computeScore(p, results, "temporal").total)
      .sort((a, b) => b - a)
      .indexOf(temporalScore.total) + 1;

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-blue-400 mb-5 transition-colors"
      >
        ← Volver al ranking
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <ParticipantAvatar
            participantId={participant.id}
            color={participant.color}
            size="lg"
            rounded="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {participant.name}
              </h1>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-0.5 rounded-full text-sm font-medium">
                #{rank} de {participants.length}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  Consolidado
                </span>
                <span className="text-3xl font-bold text-indigo-600 dark:text-blue-400">
                  {score.total}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-lg ml-1">
                  / {MAX_SCORE.total}
                </span>
              </div>
              <div className="border-l border-gray-200 dark:border-gray-600 pl-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  Temporal
                </span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {temporalScore.total}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-sm ml-1">
                  (#{temporalRank})
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
              <div
                className="h-2.5 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${(score.total / MAX_SCORE.total) * 100}%` }}
              />
            </div>
            {temporalScore.total !== score.total && (
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
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "grupos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const gr = results.groupResults[group.id] ?? {
              standings: [],
              completed: false,
            };
            const predicted = participant.groupPredictions[group.id] ?? [];
            const consolidated = scoreGroupForMode(
              predicted,
              gr.standings,
              gr.completed,
              "consolidated",
            );
            const temporal = scoreGroupForMode(
              predicted,
              gr.standings,
              gr.completed,
              "temporal",
            );
            return (
              <GroupPredictionCard
                key={group.id}
                groupId={group.id}
                groupName={group.name}
                predicted={predicted}
                actual={gr.standings}
                completed={gr.completed}
                teams={teams}
                points={consolidated.points}
                perfectBonus={consolidated.perfectBonus}
                temporalPoints={temporal.points}
                temporalPerfectBonus={temporal.perfectBonus}
              />
            );
          })}
        </div>
      )}

      {activeTab === "terceros" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <BestThirdsPanel
            predicted={participant.bestThirdPredictions}
            actual={results.bestThirds}
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
