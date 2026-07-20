export type WorkspaceAIConfidence =
  | "High"
  | "Moderate"
  | "Low";

export type WorkspaceAIEvidenceSource =
  | "Workspace Intelligence"
  | "Priority"
  | "Director"
  | "Forecast"
  | "Strategy"
  | "Risk"
  | "Insights";

export type WorkspaceAIEvidence = {
  source: WorkspaceAIEvidenceSource;
  claim: string;
};

export type WorkspaceAIResponse = {
  summary: string;
  recommendation: string;
  evidence: WorkspaceAIEvidence[];
  confidence: WorkspaceAIConfidence;
  nextStep: string;
};

export const workspaceAIResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description:
        "A concise answer to the user's workspace question.",
    },
    recommendation: {
      type: "string",
      description:
        "The main practical recommendation supported by the workspace context.",
    },
    evidence: {
      type: "array",
      description:
        "Deterministic AppStack evidence supporting the recommendation.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          source: {
            type: "string",
            enum: [
              "Workspace Intelligence",
              "Priority",
              "Director",
              "Forecast",
              "Strategy",
              "Risk",
              "Insights",
            ],
          },
          claim: {
            type: "string",
            description:
              "A specific fact taken from the named deterministic source.",
          },
        },
        required: ["source", "claim"],
      },
    },
    confidence: {
      type: "string",
      enum: ["High", "Moderate", "Low"],
      description:
        "How strongly the supplied workspace evidence supports the response.",
    },
    nextStep: {
      type: "string",
      description:
        "The immediate action the user should take next.",
    },
  },
  required: [
    "summary",
    "recommendation",
    "evidence",
    "confidence",
    "nextStep",
  ],
} as const;