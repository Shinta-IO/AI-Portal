// app/api/email/send-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase/server";
import sgMail from "@sendgrid/mail";
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice";


sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  const { invoiceId } = await req.json();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, profiles(email), estimates(title, description)")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout?invoiceId=${invoiceId}`;
  const pdfBuffer = await generateInvoicePDF(invoice, paymentUrl);

  const msg = {
    to: invoice.profiles?.email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `Invoice from Pixel Pro Portal`,
    html: `
      <p>Hi there,</p>
      <p>Please find your invoice attached.</p>
      <p>Let us know if you have any questions!</p>
    `,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `invoice_${invoice.id}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  try {
    await sgMail.send(msg);

    await supabase
      .from("invoices")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", invoiceId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
