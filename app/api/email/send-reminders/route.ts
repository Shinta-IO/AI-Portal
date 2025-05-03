// app/api/email/send-reminders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import sgMail from "@sendgrid/mail";


sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function GET() {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, amount, sent_at, last_reminder_at, profiles(email)")
    .eq("status", "unpaid")
    .lt("sent_at", daysAgo(3))
    .or(`last_reminder_at.is.null,last_reminder_at.lt.${daysAgo(3)}`);

  if (error || !invoices || invoices.length === 0) {
    return NextResponse.json({ status: "No reminders sent." });
  }

  const responses = await Promise.all(
    invoices.map(async (invoice) => {
      const email = invoice.profiles?.email;
      if (!email) return null;

      const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout?invoiceId=${invoice.id}`;

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: `Reminder: Unpaid Invoice from Pixel Pro Portal`,
        html: `
          <p>This is a friendly reminder to pay your outstanding invoice for <strong>$${invoice.amount}</strong>.</p>
          <p><a href="${paymentUrl}" style="padding: 10px 16px; background-color: #ffd700; color: black; text-decoration: none; border-radius: 4px;">Pay Now</a></p>
          <p>If you have questions or want to cancel the project, feel free to reply.</p>
        `,
      };

      await sgMail.send(msg);

      await supabase
        .from("invoices")
        .update({ last_reminder_at: new Date().toISOString() })
        .eq("id", invoice.id);

      return invoice.id;
    })
  );

  return NextResponse.json({
    status: `Reminders sent to ${responses.filter(Boolean).length} invoice(s)`,
  });
}
