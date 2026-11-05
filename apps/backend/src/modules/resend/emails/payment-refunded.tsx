import { Body, Column, Container, Head, Heading, Hr, Html, Link, Preview, Row, Section, Text } from "@react-email/components"

type Props = {
  order: {
    display_id?: string | number
    currency_code?: string
    customer?: { first_name?: string | null } | null
    billing_address?: { first_name?: string | null } | null
  }
  payment: {
    currency_code?: string
    refunds?: Array<{ id?: string; amount?: number | string | null; created_at?: string | Date | null }> | null
  }
}

const formatPrice = (value: number, currencyCode: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode.toUpperCase() }).format(value)

const refundDate = (value?: string | Date | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "short", day: "numeric" }).format(date)
}

export default function PaymentRefundedEmail({ order, payment }: Props) {
  const name = order.customer?.first_name || order.billing_address?.first_name || "there"
  const refunds = payment.refunds || []
  const refundedAmount = refunds.reduce((total, refund) => total + Number(refund.amount || 0), 0)
  const currencyCode = payment.currency_code || order.currency_code || "usd"

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media only screen and (max-width: 480px) {
            .refund-content { padding: 26px 20px !important; }
            .refund-heading { font-size: 26px !important; line-height: 34px !important; }
          }
        `}</style>
      </Head>
      <Preview>Your PetBoxNest refund has been processed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST</Text></Section>
          <Section className="refund-content" style={styles.content}>
            <Text style={styles.eyebrow}>REFUND UPDATE</Text>
            <Heading className="refund-heading" style={styles.heading}>Your refund has been processed.</Heading>
            <Text style={styles.copy}>Hi {name}, we processed a refund for order #{order.display_id || "—"}. It will be returned to the original payment method.</Text>
            {refunds.length > 0 ? (
              <Section style={styles.amountBox}>
                <Text style={styles.amountLabel}>TOTAL REFUNDED FOR THIS PAYMENT</Text>
                <Text style={styles.amount}>{formatPrice(refundedAmount, currencyCode)}</Text>
                <Text style={styles.amountNote}>Order #{order.display_id || "—"} · {refunds.length} {refunds.length === 1 ? "refund recorded" : "refunds recorded"}</Text>
              </Section>
            ) : (
              <Section style={styles.amountBox}>
                <Text style={styles.amountLabel}>ORDER #{order.display_id || "—"}</Text>
                <Text style={styles.refundNote}>The refund amount is not available in this notification. Contact us for the details.</Text>
              </Section>
            )}
            {refunds.length > 0 && (
              <>
                <Heading as="h2" style={styles.subheading}>Refund details</Heading>
                <Text style={styles.refundNote}>Each refund below is a separate transaction for this payment.</Text>
                {refunds.map((refund, index) => {
                  const date = refundDate(refund.created_at)
                  return (
                    <Section key={refund.id || index} style={styles.refundRow}>
                      <Row>
                        <Column style={styles.refundDescription}>
                          <Text style={styles.refundLabel}>Refund {index + 1}</Text>
                          <Text style={styles.footer}>{date ? `${date} (Eastern Time)` : "Date not available"}</Text>
                        </Column>
                        <Column align="right" style={styles.priceColumn}>
                          <Text style={styles.refundPrice}>{formatPrice(Number(refund.amount || 0), currencyCode)}</Text>
                        </Column>
                      </Row>
                    </Section>
                  )
                })}
              </>
            )}
            <Section style={styles.nextSteps}>
              <Text style={styles.helpHeading}>What happens next?</Text>
              <Text style={styles.footer}>Your bank or payment provider may need several business days to post the credit. The time it takes to appear depends on your original payment method.</Text>
              <Text style={styles.bankNote}>If you do not see the credit after your provider's usual processing period, contact us with your order number.</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Questions about your refund?</Text>
            <Text style={styles.footer}>Reply to this email or contact <Link href="mailto:support@petboxnest.com" style={styles.link}>support@petboxnest.com</Link> and our team will help.</Text>
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
  amountBox: { backgroundColor: "#F4F6F8", borderRadius: "16px", padding: "20px", margin: "24px 0" },
  amountLabel: { color: "#596071", fontSize: "11px", lineHeight: "18px", fontWeight: "700", letterSpacing: "1px", margin: "0 0 6px" },
  amount: { color: "#202433", fontSize: "34px", lineHeight: "42px", fontWeight: "700", margin: 0 },
  amountNote: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: "8px 0 0" },
  subheading: { color: "#202433", fontSize: "18px", lineHeight: "26px", margin: "0 0 8px" },
  refundNote: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: "0 0 12px" },
  refundRow: { padding: "14px 0", borderBottom: "1px solid #E6E8EC" },
  refundDescription: { verticalAlign: "top" },
  refundLabel: { color: "#202433", fontSize: "14px", fontWeight: "700", margin: "0 0 4px" },
  priceColumn: { width: "100px", verticalAlign: "top", whiteSpace: "nowrap" as const },
  refundPrice: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: 0 },
  nextSteps: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px", margin: "24px 0 0" },
  helpHeading: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" },
  bankNote: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: "12px 0 0" },
  link: { color: "#4A3DB8", fontWeight: "700", textDecoration: "underline" },
  divider: { borderColor: "#E6E8EC", margin: "30px 0 20px" },
  footer: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: 0 },
}
