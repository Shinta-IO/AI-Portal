// app/api/invoices/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("id");

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, estimates(title)")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const doc = new PDFDocument();
  const stream = doc.pipe(getStream.buffer());

  doc.fontSize(18).text(`Invoice #${invoice.id}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Project: ${invoice.estimates?.title || "Untitled"}`);
  doc.text(`Amount: $${(invoice.amount / 100).toFixed(2)}`);
  doc.text(`Status: ${invoice.status}`);
  doc.text(`Created: ${new Date(invoice.created_at).toLocaleString()}`);

  doc.end();
  const buffer = await stream;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice.id}.pdf`,
    },
  });
}
