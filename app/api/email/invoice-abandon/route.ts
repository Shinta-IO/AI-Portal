import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import sgMail from "@sendgrid/mail";


sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  const { invoiceId } = await req.json();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, profiles(email), estimates(title)")
    .eq("id", invoiceId)
    .single();

  if (!invoice || error || !invoice.profiles?.email) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const msg = {
    to: invoice.profiles.email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `Need help finishing your project?`,
    html: `
      <p>Hi there,</p>
      <p>We noticed you cancelled your invoice for: <strong>${invoice.estimates?.title || "your project"}</strong>.</p>
      <p>If you'd like to pick things back up or revise your scope, we're here to help.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/estimates" style="padding: 10px 16px; background-color: #ffd700; color: black; text-decoration: none; border-radius: 4px;">Revise My Request</a></p>
      <p>Thanks,<br/>The Pixel Pro Portal Team</p>
    `,
  };

  await sgMail.send(msg);
  return NextResponse.json({ success: true });
}
