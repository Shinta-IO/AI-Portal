import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Don't initialize during build time
let stripe: Stripe | null = null;
let supabase: any = null;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
    });
  }
  return stripe;
};

const getSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }
  
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
};

export async function POST(req: Request) {
  try {
    const stripeClient = getStripe();
    const supabaseClient = getSupabase();
    
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error("Missing NEXT_PUBLIC_BASE_URL environment variable");
    }
    
    const body = await req.json();
    const { projectId, participants, requesterId } = body;

    if (
      !projectId ||
      !requesterId ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return NextResponse.json({ error: "Missing or invalid input" }, { status: 400 });
    }

    const sessions: { userId: string; sessionId: string }[] = [];

    for (const { userId, amount } of participants) {
      if (typeof amount !== "number" || amount <= 0) {
        return NextResponse.json(
          { error: `Invalid amount for user ${userId}` },
          { status: 400 }
        );
      }

      const cents = Math.round(amount * 100); // ✅ Ensure backend conversion to cents

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Crowd Project Contribution",
              },
              unit_amount: cents,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/crowd?status=success&projectId=${projectId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/crowd?status=cancelled&projectId=${projectId}`,
        metadata: {
          userId,
          projectId,
        },
      });

      const { error: invoiceError } = await supabaseClient.from("invoices").insert({
        user_id: userId,
        crowd_project_id: projectId,
        amount: cents,
        status: "pending",
        stripe_session_id: session.id,
      });

      if (invoiceError) {
        console.error("❌ Invoice insert error:", invoiceError.message);
        return NextResponse.json({ error: "Failed to insert invoice" }, { status: 500 });
      }

      const { error: participationError } = await supabaseClient.from("crowd_participation").insert({
        user_id: userId,
        crowd_project_id: projectId,
        amount: cents,
        status: "pending",
      });

      if (participationError) {
        console.error("❌ Participation insert error:", participationError.message);
        return NextResponse.json({ error: "Failed to insert participation" }, { status: 500 });
      }

      sessions.push({ userId, sessionId: session.id });
    }

    const requesterSession = sessions.find((s) => s.userId === requesterId);
    if (!requesterSession) {
      return NextResponse.json({ error: "Session not found for requester" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: requesterSession.sessionId });
  } catch (err: any) {
    console.error("❌ Stripe error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
