import OpenAI from "openai";
import type { WorkspacePrompt } from "./workspacePromptBuilder";
import {
  workspaceAIResponseSchema,
  type WorkspaceAIResponse,
} from "./workspaceAIResponse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWorkspaceAIResponse(
  prompt: WorkspacePrompt
): Promise<WorkspaceAIResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await openai.responses.create({
    model: "gpt-5-mini",
reasoning: {
  effort: "minimal",
},
    instructions: prompt.instructions,
    input: prompt.input,
    text: {
  verbosity: "low",
  format: {
    type: "json_schema",
    name: "workspace_ai_response",
    schema: workspaceAIResponseSchema,
    strict: true,
  },
},
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("OpenAI returned an empty response.");
  }

  try {
    return JSON.parse(outputText) as WorkspaceAIResponse;
  } catch {
    throw new Error("OpenAI returned invalid structured JSON.");
  }
}