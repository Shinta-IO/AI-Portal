// app/api/ai/estimate.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { estimateId } = await req.json();

  // Fetch estimate + profile
  const { data: estimate, error: estError } = await supabase
    .from("estimates")
    .select("*, profiles:profiles(*)")
    .eq("id", estimateId)
    .single();

  if (estError || !estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  // Get or create thread
  let thread_id = estimate.profiles?.enzo?.thread_id;
  if (!thread_id) {
    const thread = await openai.beta.threads.create();
    thread_id = thread.id;

    // Store thread in profile
    await supabase
      .from("profiles")
      .update({ enzo: { ...(estimate.profiles?.enzo || {}), thread_id } })
      .eq("id", estimate.user_id);
  }

  // Build the message
  const message = {
    role: "user",
    content: `A client submitted an estimate request:\n\nTitle: ${estimate.title}\nDescription: ${estimate.description}\nBudget: $${estimate.budget}\nTimeline: ${estimate.timeline || "Flexible"}\n\nSuggest a professional response and outline any questions or clarifications you would ask before preparing a quote.`,
  };

  // Send to Enzo
  const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    instructions: message.content,
  });

  const messages = await openai.beta.threads.messages.list(thread_id);
  const last = messages.data.find((msg) => msg.role === "assistant");

  if (!last) {
    return NextResponse.json({ error: "No response from Enzo" }, { status: 500 });
  }

  // Update estimate with response
  await supabase
    .from("estimates")
    .update({ enzo: { response: last.content[0]?.text?.value || "" } })
    .eq("id", estimate.id);

  return NextResponse.json({ success: true, response: last.content[0]?.text?.value });
}
