import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

type Props = {
  order: {
    display_id?: string | number
    customer?: { first_name?: string | null } | null
    shipping_address?: { first_name?: string | null } | null
  }
  fulfillment: {
    labels?: Array<{ tracking_number?: string | null; tracking_url?: string | null }> | null
  }
}

export default function ShipmentCreatedEmail({ order, fulfillment }: Props) {
  const label = fulfillment.labels?.[0]
  const name = order.customer?.first_name || order.shipping_address?.first_name || "there"

  return (
    <Html lang="en">
      <Head />
      <Preview>Your PetBoxNest order is on the way</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST</Text></Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>ON THE MOVE</Text>
            <Heading style={styles.heading}>Good news, {name}. Your order has shipped.</Heading>
            <Text style={styles.copy}>Order #{order.display_id || "—"} is on its way to its new nest.</Text>
            {label?.tracking_number ? <Text style={styles.tracking}>Tracking number: {label.tracking_number}</Text> : null}
            {label?.tracking_url ? <Button href={label.tracking_url} style={styles.button}>Track my package</Button> : null}
            <Hr style={styles.divider} />
            <Text style={styles.footer}>Tracking updates can take a little time to appear after the carrier receives the package.</Text>
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
  copy: { color: "#596071", fontSize: "16px", lineHeight: "26px", margin: "0 0 18px" },
  tracking: { backgroundColor: "#F5F3FF", borderRadius: "12px", color: "#202433", fontSize: "15px", padding: "14px 16px" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "13px 22px", textDecoration: "none" },
  divider: { borderColor: "#E6E8EC", margin: "30px 0 20px" },
  footer: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: 0 },
}
