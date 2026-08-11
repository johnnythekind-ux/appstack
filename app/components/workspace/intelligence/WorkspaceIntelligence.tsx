"use client";

import { useState } from "react";
import Card from "../../Card";
import DirectorPanel from "./DirectorPanel";
import ForecastPanel from "./ForecastPanel";
import StrategyPanel from "./StrategyPanel";
import RiskPanel from "./RiskPanel";
import InsightsPanel from "./InsightsPanel";
import AIAdvisorPanel from "./AIAdvisorPanel";
import type { WorkspacePriorityAction } from "../../../../lib/workspacePriorityService";
import type { WorkspaceDirectorPlan } from "../../../../lib/workspaceDirectorService";
import type { WorkspaceForecast } from "../../../../lib/workspaceForecastService";
import type { WorkspaceRisk } from "../../../../lib/workspaceRiskService";
import type { WorkspaceStrategy } from "../../../../lib/workspaceStrategyService";
import type { WorkspaceInsights } from "../../../../lib/workspaceInsightsService";
import type { WorkspaceAIResponse } from "../../../../lib/workspaceAIResponse";

type IntelligenceTab =
  | "director"
  | "forecast"
  | "strategy"
  | "risk"
  | "insights"
  | "ai";

type WorkspaceIntelligenceProps = {
  progressPercent: number;
  directorPlan: WorkspaceDirectorPlan | null;
  priorityActions: WorkspacePriorityAction[];
  forecast: WorkspaceForecast | null;
  strategy: WorkspaceStrategy | null;
  risk: WorkspaceRisk | null;
  insights: WorkspaceInsights | null;
  aiQuestion: string;
  aiAnswer: WorkspaceAIResponse | null;
  aiLoading: boolean;
  onAIQuestionChange: (value: string) => void;
  onAskAI: () => void;
  onPriorityAction: (action: WorkspacePriorityAction) => void;
};

const intelligenceTabs: {
  id: IntelligenceTab;
  label: string;
}[] = [
  { id: "director", label: "Director" },
  { id: "forecast", label: "Forecast" },
  { id: "strategy", label: "Strategy" },
  { id: "risk", label: "Risk" },
  { id: "insights", label: "Insights" },
  { id: "ai", label: "Advisor" },
];

const intelligenceCapabilities = [
  {
    name: "Director",
    description: "Prioritizes what should happen next.",
  },
  {
    name: "Forecast",
    description: "Projects how the workspace is expected to change.",
  },
  {
    name: "Strategy",
    description: "Determines execution order and tradeoffs.",
  },
  {
    name: "Risk",
    description: "Identifies operational exposure and safeguards.",
  },
  {
    name: "Insights",
    description: "Surfaces patterns across workspace activity.",
  },
  {
    name: "Advisor",
    description:
      "Provides a natural-language interface over the intelligence layer.",
  },
];

export default function WorkspaceIntelligence({
  progressPercent,
  directorPlan,
  priorityActions,
  forecast,
  strategy,
  risk,
  insights,
  aiQuestion,
  aiAnswer,
  aiLoading,
  onAIQuestionChange,
  onAskAI,
  onPriorityAction,
}: WorkspaceIntelligenceProps) {
  const [activeTab, setActiveTab] =
    useState<IntelligenceTab>("director");

  const [showHowItWorks, setShowHowItWorks] =
    useState(false);

  return (
    <Card>
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Workspace Intelligence
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Operational analysis derived from workspace activity, state,
              dependencies, and execution history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHowItWorks((current) => !current)}
            aria-expanded={showHowItWorks}
            className="self-start rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
          >
            {showHowItWorks ? "Hide how it works" : "How it works"}
          </button>
        </div>

        {showHowItWorks && (
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              How Workspace Intelligence Works
            </p>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
              This demo turns workspace activity into structured operational
              intelligence using deterministic analysis services, derived
              workspace state, and an AI advisory layer.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {intelligenceCapabilities.map((capability) => (
                <div
                  key={capability.name}
                  className="rounded-lg border border-slate-800 p-4"
                >
                  <p className="font-semibold text-white">
                    {capability.name}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2 overflow-x-auto">
          {intelligenceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "director" && (
          <DirectorPanel
            progressPercent={progressPercent}
            directorPlan={directorPlan}
            priorityActions={priorityActions}
          />
        )}

        {activeTab === "forecast" && (
          <ForecastPanel
            currentProgress={progressPercent}
            forecast={forecast}
          />
        )}

        {activeTab === "strategy" && (
          <StrategyPanel strategy={strategy} />
        )}

        {activeTab === "risk" && (
          <RiskPanel risk={risk} />
        )}

        {activeTab === "insights" && (
          <InsightsPanel insights={insights} />
        )}

        {activeTab === "ai" && (
          <AIAdvisorPanel
            question={aiQuestion}
            answer={aiAnswer}
            loading={aiLoading}
            onQuestionChange={onAIQuestionChange}
            onAsk={onAskAI}
            priorityActions={priorityActions}
            onPriorityAction={onPriorityAction}
          />
        )}
      </div>
    </Card>
  );
}