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
  { id: "ai", label: "AI" },
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

  return (
    <Card title="Workspace Intelligence">
      <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-3">
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