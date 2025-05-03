// components/pdf/pdf-invoice-template.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export const InvoicePDF = ({ invoice, qrCodeUrl }: { invoice: any; qrCodeUrl: string }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo */}
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <Text style={styles.heading}>Invoice</Text>
        </View>

        {/* Invoice Metadata */}
        <View style={styles.section}>
          <Text>Invoice ID: {invoice.id}</Text>
          <Text>Date: {new Date(invoice.created_at).toLocaleDateString()}</Text>
          <Text>Status: {invoice.status}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text>Client: {invoice.profiles.first_name} {invoice.profiles.last_name}</Text>
        </View>

        {/* Estimate Summary */}
        <View style={styles.section}>
          <Text>Project Title: {invoice.estimates.title}</Text>
          <Text>Description: {invoice.estimates.description}</Text>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.totalLabel}>Total Due:</Text>
          <Text style={styles.totalAmount}>${(invoice.amount / 100).toFixed(2)}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Image src={qrCodeUrl} style={styles.qrImage} />
          <Text style={styles.qrText}>Scan to pay</Text>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  qrSection: {
    marginTop: 30,
    alignItems: "center",
  },
  qrImage: {
    width: 100,
    height: 100,
  },
  qrText: {
    marginTop: 10,
    fontSize: 10,
    color: "#555",
  },
});
