import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

type Props = {
  order: {
    display_id?: string | number
    customer?: { first_name?: string | null } | null
    shipping_address?: { first_name?: string | null } | null
  }
  fulfillment: {
    shipped_at?: string | Date | null
    labels?: Array<{ id?: string; tracking_number?: string | null; tracking_url?: string | null }> | null
  }
}

export default function ShipmentCreatedEmail({ order, fulfillment }: Props) {
  const labels = (fulfillment.labels || []).filter(label => label.tracking_number?.trim() || label.tracking_url?.trim())
  const name = order.customer?.first_name || order.shipping_address?.first_name || "there"
  const shippedAt = fulfillment.shipped_at ? new Date(fulfillment.shipped_at) : null
  const shippedDate = shippedAt && !Number.isNaN(shippedAt.getTime())
    ? new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "short", day: "numeric" }).format(shippedAt)
    : null

  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media only screen and (max-width: 480px) {
            .shipment-content { padding: 26px 20px !important; }
            .shipment-heading { font-size: 26px !important; line-height: 34px !important; }
          }
        `}</style>
      </Head>
      <Preview>Your PetBoxNest order is on the way</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST</Text></Section>
          <Section className="shipment-content" style={styles.content}>
            <Text style={styles.eyebrow}>ON THE MOVE</Text>
            <Heading className="shipment-heading" style={styles.heading}>Your order is on the way.</Heading>
            <Text style={styles.copy}>Good news, {name}. Your shipment for order #{order.display_id || "—"} is on its way.</Text>
            <Section style={styles.orderCard}>
              <Text style={styles.label}>ORDER NUMBER</Text>
              <Text style={styles.orderNumber}>#{order.display_id || "—"}</Text>
              {shippedDate && <Text style={styles.date}>Shipped on {shippedDate} (Eastern Time)</Text>}
            </Section>
            <Heading as="h2" style={styles.subheading}>Follow your delivery</Heading>
            {labels.length > 0 ? labels.map((label, index) => (
              <Section key={label.id || index} style={styles.tracking}>
                <Text style={styles.label}>{labels.length > 1 ? `PACKAGE ${index + 1} OF ${labels.length}` : "PACKAGE TRACKING"}</Text>
                {label.tracking_number?.trim() && <Text style={styles.trackingNumber}>{label.tracking_number.trim()}</Text>}
                {label.tracking_url?.trim() ? (
                  <>
                    <Button href={label.tracking_url.trim()} style={styles.button}>Track my package</Button>
                    <Text style={styles.backupLink}>
                      Or open the <Link href={label.tracking_url.trim()} style={styles.link}>tracking link</Link> directly.
                    </Text>
                  </>
                ) : (
                  <Text style={styles.trackingHelp}>A tracking link is not available yet. Keep this tracking number handy, or contact us for help following your package.</Text>
                )}
              </Section>
            )) : (
              <Section style={styles.tracking}>
                <Text style={styles.trackingHelp}>Tracking details are not available yet. Please contact us if you need help following your shipment.</Text>
              </Section>
            )}
            <Text style={styles.footer}>Tracking updates can take a little time to appear after the carrier receives the package.{labels.length > 1 ? " Packages may arrive separately." : ""}</Text>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Need a hand?</Text>
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
  copy: { color: "#596071", fontSize: "16px", lineHeight: "26px", margin: "0 0 18px" },
  orderCard: { backgroundColor: "#F4F6F8", borderRadius: "16px", padding: "18px 20px", margin: "24px 0" },
  label: { color: "#596071", fontSize: "11px", lineHeight: "18px", fontWeight: "700", letterSpacing: "1px", margin: 0 },
  orderNumber: { color: "#202433", fontSize: "20px", fontWeight: "700", lineHeight: "28px", margin: "4px 0 0", overflowWrap: "anywhere" as const },
  date: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: "8px 0 0" },
  subheading: { color: "#202433", fontSize: "18px", lineHeight: "26px", margin: "0 0 14px" },
  tracking: { border: "1px solid #E6E8EC", borderRadius: "16px", padding: "18px 20px", margin: "0 0 16px" },
  trackingNumber: { color: "#202433", fontSize: "16px", lineHeight: "24px", fontWeight: "700", margin: "8px 0 14px", wordBreak: "break-all" as const },
  trackingHelp: { color: "#596071", fontSize: "14px", lineHeight: "23px", margin: "8px 0 0" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "13px 22px", textDecoration: "none" },
  backupLink: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "12px 0 0" },
  link: { color: "#4A3DB8", fontWeight: "700", textDecoration: "underline" },
  helpHeading: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" },
  divider: { borderColor: "#E6E8EC", margin: "30px 0 20px" },
  footer: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: 0 },
}
