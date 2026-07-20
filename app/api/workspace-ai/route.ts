import { NextResponse } from "next/server";
import {
  buildWorkspaceAIContext,
  type BuildWorkspaceAIContextInput,
} from "../../../lib/workspaceAIContextBuilder";
import { generateWorkspaceAIResponse } from "../../../lib/openai";
import { buildWorkspacePrompt } from "../../../lib/workspacePromptBuilder";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BuildWorkspaceAIContextInput;

    if (
      typeof body.question !== "string" ||
      body.question.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "A workspace question is required.",
        },
        {
          status: 400,
        }
      );
    }

    const context = buildWorkspaceAIContext({
      ...body,
      question: body.question.trim(),
    });

    const prompt = buildWorkspacePrompt(context);

    const answer = await generateWorkspaceAIResponse(prompt);

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    console.error("Workspace AI request failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "The workspace AI request failed.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}