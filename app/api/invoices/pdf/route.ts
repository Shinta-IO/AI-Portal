import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/pdf-invoice-template"; // ✅ Make sure this is a .tsx React component

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
    .select("*, profiles(first_name, last_name), estimates(title, description)")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://yourdomain.com/pay/${invoice.id}`;

  // ✅ This part is fixed: render JSX inside renderToBuffer
  const pdfBuffer = await renderToBuffer(
    InvoicePDF({ invoice, qrCodeUrl }) // NOT JSX — call the function
  );

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice.id}.pdf`,
    },
  });
}
