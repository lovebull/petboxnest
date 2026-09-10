import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

type Props = {
  order: {
    display_id?: string | number
    currency_code?: string
    customer?: { first_name?: string | null } | null
    billing_address?: { first_name?: string | null } | null
  }
  payment: {
    currency_code?: string
    refunds?: Array<{ amount?: number | string | null }> | null
  }
}

const formatPrice = (value: number, currencyCode: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode.toUpperCase() }).format(value)

export default function PaymentRefundedEmail({ order, payment }: Props) {
  const name = order.customer?.first_name || order.billing_address?.first_name || "there"
  const refundedAmount = (payment.refunds || []).reduce((total, refund) => total + Number(refund.amount || 0), 0)
  const currencyCode = payment.currency_code || order.currency_code || "usd"

  return (
    <Html lang="en">
      <Head />
      <Preview>Your PetBoxNest refund has been processed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST</Text></Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>REFUND UPDATE</Text>
            <Heading style={styles.heading}>Your refund is on its way, {name}.</Heading>
            <Text style={styles.copy}>We processed a refund for order #{order.display_id || "—"}.</Text>
            <Section style={styles.amountBox}>
              <Text style={styles.amountLabel}>Total refunded</Text>
              <Text style={styles.amount}>{formatPrice(refundedAmount, currencyCode)}</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.footer}>Your bank or card issuer may need several business days to post the credit to your account.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: "#FFF8EF", color: "#202433", fontFamily: "Arial, sans-serif", margin: 0, padding: "32px 12px" },
  container: { backgroundColor: "#ffffff", border: "1px solid #E6E8EC", borderRadius: "24px", margin: "0 auto", maxWidth: "600px", overflow: "hidden" },
  header: { backgroundColor: "#6557D9", padding: "20px 28px" },
  brand: { color: "#ffffff", fontSize: "18px", fontWeight: "700", letterSpacing: "2px", margin: 0 },
  content: { padding: "34px 28px" },
  eyebrow: { color: "#4A3DB8", fontSize: "12px", fontWeight: "700", letterSpacing: "1.6px", margin: "0 0 12px" },
  heading: { color: "#202433", fontSize: "28px", lineHeight: "36px", margin: "0 0 14px" },
  copy: { color: "#596071", fontSize: "16px", lineHeight: "26px", margin: "0 0 20px" },
  amountBox: { backgroundColor: "#F5F3FF", borderRadius: "16px", padding: "18px 20px" },
  amountLabel: { color: "#596071", fontSize: "13px", margin: "0 0 6px" },
  amount: { color: "#202433", fontSize: "26px", fontWeight: "700", margin: 0 },
  divider: { borderColor: "#E6E8EC", margin: "30px 0 20px" },
  footer: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: 0 },
}
