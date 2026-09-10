import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

type Props = {
  order: {
    id: string
    display_id?: string | number
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

  return (
    <Html lang="en">
      <Head />
      <Preview>New PetBoxNest order received</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST OPERATIONS</Text></Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>NEW ORDER</Text>
            <Heading style={styles.heading}>Order #{order.display_id || "—"} needs attention.</Heading>
            <Text style={styles.copy}>Customer: {order.email || "—"}</Text>
            <Text style={styles.total}>Total: {formatPrice(Number(order.total || 0), order.currency_code || "usd")}</Text>
            <Text style={styles.copy}>Items: {itemCount}</Text>
            <Text style={styles.link}>Open order: {admin_url}</Text>
            <Hr style={styles.divider} />
            <Text style={styles.footer}>This operational alert was generated automatically by PetBoxNest.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: "#F4F4F1", color: "#202433", fontFamily: "Arial, sans-serif", margin: 0, padding: "32px 12px" },
  container: { backgroundColor: "#ffffff", border: "1px solid #E6E8EC", borderRadius: "20px", margin: "0 auto", maxWidth: "600px", overflow: "hidden" },
  header: { backgroundColor: "#202433", padding: "20px 28px" },
  brand: { color: "#ffffff", fontSize: "16px", fontWeight: "700", letterSpacing: "1.8px", margin: 0 },
  content: { padding: "32px 28px" },
  eyebrow: { color: "#4A3DB8", fontSize: "12px", fontWeight: "700", letterSpacing: "1.6px", margin: "0 0 12px" },
  heading: { color: "#202433", fontSize: "26px", lineHeight: "34px", margin: "0 0 18px" },
  copy: { color: "#596071", fontSize: "15px", lineHeight: "24px", margin: "0 0 8px" },
  total: { color: "#202433", fontSize: "18px", fontWeight: "700", margin: "12px 0" },
  link: { color: "#4A3DB8", fontSize: "14px", lineHeight: "22px", margin: "18px 0", wordBreak: "break-all" as const },
  divider: { borderColor: "#E6E8EC", margin: "26px 0 18px" },
  footer: { color: "#596071", fontSize: "12px", lineHeight: "19px", margin: 0 },
}
