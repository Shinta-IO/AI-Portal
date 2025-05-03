// lib/pdf/generate-invoice.tsx
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { InvoicePDF } from "@/components/pdf/pdf-invoice-template";

export async function generateInvoicePDF(invoice: any, paymentUrl: string): Promise<Buffer> {
  const qrCodeUrl = await QRCode.toDataURL(paymentUrl);
  const pdfDoc = <InvoicePDF invoice={invoice} qrCodeUrl={qrCodeUrl} />;
  return await renderToBuffer(pdfDoc);
}
