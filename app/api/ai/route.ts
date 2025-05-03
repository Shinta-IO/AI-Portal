import { OpenAI } from "openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || !assistantId) {
      throw new Error("Missing OpenAI API key or Assistant ID.");
    }

    const openai = new OpenAI({ apiKey });

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === "failed") {
      throw new Error(`Assistant run failed: ${JSON.stringify(runStatus)}`);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = messages.data.find((msg) => msg.role === "assistant");
    const result = reply?.content[0]?.text?.value ?? "Enzo had no answer.";

    return Response.json({ result });
  } catch (error: any) {
    console.error("🔥 Enzo error:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({
        error: error?.message || "Unknown error occurred in /api/ai",
      }),
      { status: 500 }
    );
  }
}
