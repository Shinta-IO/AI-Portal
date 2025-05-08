// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ENV VARS
const {
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL,
} = process.env;

// Don't throw during build, only when the route is called
const checkEnvVars = () => {
  if (!STRIPE_SECRET_KEY || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !NEXT_PUBLIC_APP_URL) {
    throw new Error("Missing required environment variables for Stripe or Supabase.");
  }
};

// Stripe instance - initialized only when needed
let stripe: Stripe | null = null;
let supabase: any = null;

const getStripe = () => {
  checkEnvVars();
  if (!stripe) {
    stripe = new Stripe(STRIPE_SECRET_KEY!, {
      apiVersion: "2025-04-30.basil",
    });
  }
  return stripe;
};

// Supabase service client - initialized only when needed
const getSupabase = () => {
  checkEnvVars();
  if (!supabase) {
    supabase = createClient(NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  }
  return supabase;
};

export async function POST(req: NextRequest) {
  try {
    // Only check env vars when the route is actually called
    checkEnvVars();
    
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    // Get initialized clients
    const stripeClient = getStripe();
    const supabaseClient = getSupabase();

    // Fetch invoice from Supabase
    const { data: invoice, error } = await supabaseClient
      .from("invoices")
      .select("id, amount, user_id")
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) {
      console.error("Invoice fetch error:", error || "No invoice found");
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (typeof invoice.amount !== "number" || invoice.amount < 100) {
      return NextResponse.json({ error: "Invalid invoice amount. Must be at least $1.00" }, { status: 400 });
    }

    if (!invoice.user_id) {
      return NextResponse.json({ error: "Missing user_id on invoice" }, { status: 400 });
    }

    // Create Stripe Checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice ${invoice.id}`,
            },
            unit_amount: invoice.amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${NEXT_PUBLIC_APP_URL}/dashboard/invoices?success=true`,
      cancel_url: `${NEXT_PUBLIC_APP_URL}/dashboard/invoices?canceled=true`,
      metadata: {
        invoice_id: invoice.id,
        user_id: invoice.user_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
