import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: "Missing webhook secret or signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Invalid Stripe signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;

    try {
      // Lookup invoice by session ID
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single();

      if (invoiceError || !invoice) {
        console.error("❌ Invoice not found for session:", sessionId, invoiceError);
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      // Mark invoice as paid
      const { error: updateInvoiceError } = await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoice.id);

      if (updateInvoiceError) throw updateInvoiceError;

      // Update participation record
      const { error: participationError } = await supabase
        .from("crowd_participation")
        .update({
          status: "confirmed",
          paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq("user_id", invoice.user_id)
        .eq("crowd_project_id", invoice.crowd_project_id);

      if (participationError) throw participationError;

      // Check if all expected participants have paid
      const { data: project, error: projectError } = await supabase
        .from("crowd_projects")
        .select("expected_participants")
        .eq("id", invoice.crowd_project_id)
        .single();

      if (projectError || !project) throw new Error("Failed to fetch project data");

      const { count: confirmedCount } = await supabase
        .from("crowd_participation")
        .select("id", { count: "exact" })
        .eq("crowd_project_id", invoice.crowd_project_id)
        .eq("status", "confirmed");

      if (confirmedCount === project.expected_participants) {
        // All users paid — mark project as funded
        const { error: fundError } = await supabase
          .from("crowd_projects")
          .update({ status: "funded" })
          .eq("id", invoice.crowd_project_id);

        if (fundError) throw fundError;

        console.log(`🎉 Project ${invoice.crowd_project_id} is now fully funded!`);
      } else {
        console.log(`✅ Payment confirmed for user ${invoice.user_id}, waiting for others...`);
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("❌ Webhook processing failed:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
