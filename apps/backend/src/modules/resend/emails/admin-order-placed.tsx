import { Body, Button, Column, Container, Head, Heading, Hr, Html, Link, Preview, Row, Section, Text } from "@react-email/components"
import { adminOrderSubject } from "../admin-order-subject"

type Props = {
  order: {
    id: string
    display_id?: string | number
    created_at?: string | Date | null
    email?: string | null
    currency_code?: string
    total?: number | string | null
    items?: Array<{ quantity?: number }> | null
  }
  admin_url: string
}

const formatPrice = (value: number, currencyCode: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode.toUpperCase() }).format(value)

export default function AdminOrderPlacedEmail({ order, admin_url }: Props) {
  const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const orderUrl = new URL(`/app/orders/${encodeURIComponent(order.id)}`, admin_url).toString()

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media only screen and (max-width: 480px) {
            .admin-order-content { padding: 24px 20px !important; }
            .admin-order-heading { font-size: 26px !important; line-height: 34px !important; }
          }
        `}</style>
      </Head>
      <Preview>{`${adminOrderSubject(order)} · ${formatPrice(Number(order.total || 0), order.currency_code || "usd")}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PetBoxNest OPERATIONS</Text></Section>
          <Section className="admin-order-content" style={styles.content}>
            <Text style={styles.eyebrow}>NEW ORDER</Text>
            <Heading className="admin-order-heading" style={styles.heading}>New PetBoxNest order received.</Heading>
            <Text style={styles.copy}>Order #{order.display_id || "—"} has been received. Review the order details and payment status before preparing it for delivery.</Text>
            <Section style={styles.summary}>
              <Text style={styles.label}>ORDER TOTAL</Text>
              <Text style={styles.total}>{formatPrice(Number(order.total || 0), order.currency_code || "usd")}</Text>
              <Hr style={styles.summaryDivider} />
              <Row>
                <Column><Text style={styles.label}>ORDER NUMBER</Text><Text style={styles.value}>#{order.display_id || "—"}</Text></Column>
                <Column align="right"><Text style={styles.label}>ITEM QUANTITY</Text><Text style={styles.value}>{itemCount}</Text></Column>
              </Row>
            </Section>
            <Text style={styles.label}>CUSTOMER EMAIL</Text>
            <Text style={styles.customer}>
              {order.email ? <Link href={`mailto:${order.email}`} style={styles.customerLink}>{order.email}</Link> : "—"}
            </Text>
            <Button href={orderUrl} style={styles.button}>Open order</Button>
            <Text style={styles.hint}>Sign in to Medusa Admin to view this order.</Text>
            <Text style={styles.link}>
              Or open the order directly:<br />
              <Link href={orderUrl} style={styles.directLink}>{orderUrl}</Link>
            </Text>
            <Hr style={styles.divider} />
            <Text style={styles.footer}>This operational alert was generated automatically by PetBoxNest.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: "#FFF8EF", color: "#202433", fontFamily: "Arial, sans-serif", margin: 0, padding: "32px 12px" },
  container: { backgroundColor: "#ffffff", border: "1px solid #E6E8EC", borderRadius: "20px", margin: "0 auto", maxWidth: "600px", overflow: "hidden" },
  header: { backgroundColor: "#6557D9", padding: "20px 28px" },
  brand: { color: "#ffffff", fontSize: "14px", lineHeight: "22px", fontWeight: "700", letterSpacing: "1.5px", margin: 0 },
  content: { padding: "32px 28px" },
  eyebrow: { color: "#4A3DB8", fontSize: "12px", fontWeight: "700", letterSpacing: "1.6px", margin: "0 0 12px" },
  heading: { color: "#202433", fontSize: "30px", lineHeight: "38px", margin: "0 0 12px" },
  copy: { color: "#596071", fontSize: "15px", lineHeight: "24px", margin: "0 0 8px" },
  summary: { backgroundColor: "#F4F6F8", borderRadius: "16px", padding: "20px", margin: "24px 0" },
  label: { color: "#596071", fontSize: "11px", lineHeight: "18px", letterSpacing: "1px", fontWeight: "700", margin: 0 },
  total: { color: "#202433", fontSize: "32px", lineHeight: "40px", fontWeight: "700", margin: "6px 0 0" },
  value: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: "4px 0 0" },
  summaryDivider: { borderColor: "#E6E8EC", margin: "16px 0" },
  customer: { fontSize: "15px", lineHeight: "24px", margin: "4px 0 24px", overflowWrap: "anywhere" as const },
  customerLink: { color: "#202433", textDecoration: "underline" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#ffffff", fontSize: "15px", fontWeight: "700", padding: "15px 24px", textAlign: "center" as const },
  hint: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "12px 0 0" },
  link: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "16px 0 0" },
  directLink: { color: "#4A3DB8", textDecoration: "underline", wordBreak: "break-all" as const },
  divider: { borderColor: "#E6E8EC", margin: "26px 0 18px" },
  footer: { color: "#596071", fontSize: "12px", lineHeight: "19px", margin: 0 },
}
