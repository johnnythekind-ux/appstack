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

export default function AIAdvisorPanel({
  question,
  answer,
  loading,
  onQuestionChange,
  onAsk,
  priorityActions,
  onPriorityAction,
}: AIAdvisorPanelProps) {
  return (
    <div>
      <p className="text-sm leading-6 text-slate-400">
        Ask AppStack AI about the current workspace, priorities, forecast,
        strategy, risks, or insights.
      </p>

      <textarea
        id="workspace-ai-question"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="What should I focus on today?"
        rows={4}
        className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-900 p-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
      />

      <div className="mt-4">
        <Button onClick={onAsk} disabled={loading}>
          {loading ? "Thinking..." : "Ask AppStack AI"}
        </Button>
      </div>

      {answer && (
        <div
          id="workspace-ai-answer"
          className="mt-6 space-y-5 rounded-xl border border-slate-800 p-5"
        >
          <div>
            <p className="text-sm text-slate-400">
              Today&apos;s Situation
            </p>

            <p className="mt-2 leading-7">
              {answer.summary}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Today&apos;s Focus
            </p>

            <p className="mt-2 font-semibold leading-7">
              {answer.recommendation}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Evidence
            </p>

            <ul className="mt-3 space-y-3">
              {answer.evidence.map((item, index) => (
                <li
                  key={`${item.source}-${item.claim}-${index}`}
                  className="flex gap-3"
                >
                  <span aria-hidden="true">✓</span>
                  <span>{item.claim}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Next Step
            </p>

            <p className="mt-2 font-semibold">
              {answer.nextStep}
            </p>

            {priorityActions[0] && (
              <RecommendedActionButton
                label={priorityActions[0].title}
                onClick={() => onPriorityAction(priorityActions[0])}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}