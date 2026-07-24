import Button from "../../Button";
import { RecommendedActionButton } from "../../RecommendedActionButton";
import type { WorkspaceAIResponse } from "../../../../lib/workspaceAIResponse";
import type { WorkspacePriorityAction } from "../../../../lib/workspacePriorityService";

type AIAdvisorPanelProps = {
  question: string;
  answer: WorkspaceAIResponse | null;
  loading: boolean;
  onQuestionChange: (value: string) => void;
  onAsk: () => void;
  priorityActions: WorkspacePriorityAction[];
  onPriorityAction: (action: WorkspacePriorityAction) => void;
};

const suggestedQuestions = [
  "What should I focus on today?",
  "What is the biggest risk in this workspace?",
  "What is slowing down progress?",
  "What should happen next?",
];

export default function AIAdvisorPanel({
  question,
  answer,
  loading,
  onQuestionChange,
  onAsk,
  priorityActions,
  onPriorityAction,
}: AIAdvisorPanelProps) {
  const recommendedPriorityAction = priorityActions[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              AI Workspace Advisor
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              Ask the workspace—not a generic chatbot.
            </h3>
          </div>

          <div className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace Grounded
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          AppStack AI answers using the current Workspace Intelligence,
          priorities, director plan, forecast, strategy, risk assessment,
          and insights.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Suggested Questions
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedQuestions.map((suggestedQuestion) => (
            <button
              key={suggestedQuestion}
              type="button"
              onClick={() => onQuestionChange(suggestedQuestion)}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
            >
              {suggestedQuestion}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 p-5">
        <label
          htmlFor="workspace-ai-question"
          className="text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          Ask the Workspace
        </label>

        <textarea
          id="workspace-ai-question"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="What should I focus on today?"
          rows={4}
          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button onClick={onAsk} disabled={loading}>
            {loading ? "Analyzing Workspace..." : "Ask AppStack AI"}
          </Button>

          <p className="text-sm text-slate-500">
            The response will be grounded in current deterministic workspace
            evidence.
          </p>
        </div>
      </div>

      {!answer && !loading && (
        <div className="rounded-xl border border-dashed border-slate-800 p-6">
          <p className="font-semibold">
            No AI briefing generated yet.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Ask a question above to receive a recommendation supported by
            the current workspace intelligence pipeline.
          </p>
        </div>
      )}

      {answer && (
        <div
          id="workspace-ai-answer"
          className="space-y-6 rounded-2xl border border-slate-800 p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                AI Advisory Brief
              </p>

              <h3 className="mt-3 text-xl font-bold">
                Workspace Recommendation
              </h3>
            </div>

            <div className="rounded-full border border-slate-700 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Confidence
              </span>

              <span className="ml-2 font-bold text-white">
                {answer.confidence}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Situation
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              {answer.summary}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recommended Focus
            </p>

            <p className="mt-3 text-lg font-semibold leading-7">
              {answer.recommendation}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Evidence Used
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Deterministic facts supporting the recommendation.
                </p>
              </div>

              <span className="text-sm font-semibold text-slate-400">
                {answer.evidence.length} sources
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {answer.evidence.map((item, index) => (
                <div
                  key={`${item.source}-${item.claim}-${index}`}
                  className="rounded-lg border border-slate-800 p-4"
                >
                  <div className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-sm font-bold">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {item.source}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {item.claim}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Immediate Next Step
            </p>

            <p className="mt-3 font-semibold leading-7">
              {answer.nextStep}
            </p>

            {recommendedPriorityAction && (
              <div className="mt-5">
                <RecommendedActionButton
                  label={recommendedPriorityAction.title}
                  onClick={() =>
                    onPriorityAction(recommendedPriorityAction)
                  }
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Advisory Boundary
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              This recommendation interprets AppStack&apos;s deterministic
              workspace outputs. It does not replace the underlying forecast,
              strategy, risk, or priority services.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}