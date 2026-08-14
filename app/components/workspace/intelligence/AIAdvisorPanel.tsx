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
  isAdviceStale: boolean;
};

const activeWorkQuestions = [
  "What should I focus on today?",
  "What is the biggest risk in this workspace?",
  "What is slowing down progress?",
  "What should happen next?",
];

const caughtUpQuestions = [
  "What does the workspace tell me right now?",
  "Are there any risks I should monitor?",
  "What patterns stand out?",
  "What should I watch for next?",
];

export default function AIAdvisorPanel({
  question,
  answer,
  loading,
  onQuestionChange,
  onAsk,
  priorityActions,
  onPriorityAction,
  isAdviceStale,
}: AIAdvisorPanelProps) {
  const recommendedPriorityAction = priorityActions[0];
  const hasPriorityWork = priorityActions.length > 0;

  const suggestedQuestions = hasPriorityWork
    ? activeWorkQuestions
    : caughtUpQuestions;

  const placeholder = hasPriorityWork
    ? "What should I focus on today?"
    : "What does the workspace tell me right now?";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              AI Workspace Advisor
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              Ask the workspace—not a generic chatbot.
            </h3>
          </div>

          <div className="rounded-full border border-border bg-surface-muted px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Grounded in Workspace Data
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          AppStack AI interprets the current Workspace Intelligence layer,
          including priorities, director guidance, forecast, strategy, risk,
          and insights.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Suggested Questions
            </p>

            <p className="mt-2 text-sm text-muted">
              {hasPriorityWork
                ? "Questions are tuned to the workspace's current unfinished work."
                : "The workspace is caught up, so these questions focus on interpretation, monitoring, and emerging patterns."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedQuestions.map((suggestedQuestion) => (
            <button
              key={suggestedQuestion}
              type="button"
              onClick={() => onQuestionChange(suggestedQuestion)}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted transition hover:border-accent hover:bg-accent-soft hover:text-accent"
            >
              {suggestedQuestion}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <label
          htmlFor="workspace-ai-question"
          className="text-xs font-semibold uppercase tracking-wider text-subtle"
        >
          Ask the Workspace
        </label>

        <textarea
          id="workspace-ai-question"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className="mt-4 w-full rounded-lg border border-border bg-surface p-4 text-foreground outline-none placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button onClick={onAsk} disabled={loading}>
            {loading ? "Analyzing Workspace..." : "Ask AppStack AI"}
          </Button>

          <p className="text-sm text-subtle">
            The response will be grounded in current deterministic workspace
            evidence.
          </p>
        </div>
      </div>

      {!answer && !loading && (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted p-6">
          <p className="font-semibold">
            No AI briefing generated yet.
          </p>

          <p className="mt-2 text-sm leading-6 text-muted">
            Ask a question above to receive an interpretation supported by
            the current Workspace Intelligence pipeline.
          </p>
        </div>
      )}

      {answer && (
        <div
          id="workspace-ai-answer"
          className="space-y-6 rounded-2xl border border-border bg-surface p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                AI Advisory Brief
              </p>

              <h3 className="mt-3 text-xl font-bold">
                Workspace Advisory
              </h3>
            </div>

            <div className="rounded-full border border-border bg-surface-muted px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Confidence
              </span>

              <span className="ml-2 font-bold text-foreground">
                {answer.confidence}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Situation
            </p>

            <p className="mt-3 leading-7 text-muted">
              {answer.summary}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Recommended Focus
            </p>

            <p className="mt-3 text-lg font-semibold leading-7">
              {answer.recommendation}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                  Evidence Used
                </p>

                <p className="mt-2 text-sm text-muted">
                  Deterministic workspace facts supporting this interpretation.
                </p>
              </div>

              <span className="text-sm font-semibold text-muted">
                {answer.evidence.length} sources
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {answer.evidence.map((item, index) => (
                <div
                  key={`${item.source}-${item.claim}-${index}`}
                  className="rounded-lg border border-border bg-surface-muted p-4"
                >
                  <div className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold text-muted">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                        {item.source}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted">
                        {item.claim}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Immediate Next Step
            </p>

            <p className="mt-3 font-semibold leading-7">
              {answer.nextStep}
            </p>

            {recommendedPriorityAction && !isAdviceStale && (
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

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
              Advisory Boundary
            </p>

            <p className="mt-3 text-sm leading-6 text-muted">
              This advisory interprets AppStack&apos;s deterministic
              workspace outputs. It does not replace the underlying director,
              forecast, strategy, risk, insights, or priority services.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}