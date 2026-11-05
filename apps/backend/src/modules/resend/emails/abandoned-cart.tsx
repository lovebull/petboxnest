import { Body, Button, Column, Container, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components"

type CartReminderItem = {
  id: string
  title: string
  quantity: number
  unit_price?: number | string | null
  thumbnail?: string | null
}

type AbandonedCartProps = {
  items?: CartReminderItem[]
  currency_code?: string | null
  total?: number | string | null
  recovery_url: string
  unsubscribe_url: string
  expires_at?: string | Date | null
}

export default function AbandonedCartEmail({ items = [], currency_code, total, recovery_url, unsubscribe_url, expires_at }: AbandonedCartProps) {
  const formatMoney = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—"
    const currency = String(currency_code || "USD").toUpperCase()
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value))
    } catch {
      return `${Number(value).toFixed(2)} ${currency}`
    }
  }
  const expiresAt = expires_at ? new Date(expires_at) : null
  const expiration = expiresAt && !Number.isNaN(expiresAt.getTime())
    ? new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", year: "numeric", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(expiresAt)
    : null

  return (
    <Html lang="en">
      <Head>
        <style>{`@media only screen and (max-width: 480px) {
          .cart-reminder-content { padding: 26px 20px !important; }
          .cart-reminder-heading { font-size: 26px !important; line-height: 34px !important; }
          .cart-reminder-image { width: 64px !important; height: 64px !important; }
          .cart-reminder-image-column { width: 76px !important; }
        }`}</style>
      </Head>
      <Preview>Your PetBoxNest cart is waiting</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PetBoxNest</Text></Section>
          <Section className="cart-reminder-content" style={styles.content}>
            <Text style={styles.eyebrow}>YOUR CART</Text>
            <Heading className="cart-reminder-heading" style={styles.heading}>A few good picks, still in your cart.</Heading>
            <Text style={styles.copy}>Still thinking it over? Take another look at the items you picked for your pet, whenever you are ready.</Text>
            <Heading as="h2" style={styles.sectionHeading}>Your selected items</Heading>
            <Section style={styles.productCard}>
              {items.slice(0, 4).map((item) => (
                <Section key={item.id} style={styles.item}>
                  <Row style={styles.itemRow}>
                    <Column className="cart-reminder-image-column" style={styles.imageColumn}>
                      {item.thumbnail?.trim() ? (
                        <Img className="cart-reminder-image" src={item.thumbnail.trim()} alt={item.title} width="80" height="80" style={styles.image} />
                      ) : (
                        <Section className="cart-reminder-image" style={styles.placeholder}><Text style={styles.placeholderText}>No image</Text></Section>
                      )}
                    </Column>
                    <Column style={styles.details}>
                      <Text style={styles.productTitle}>{item.title}</Text>
                      <Text style={styles.itemMeta}>Quantity: {item.quantity}</Text>
                      <Text style={styles.itemMeta}>Unit price: {formatMoney(item.unit_price)}</Text>
                    </Column>
                  </Row>
                </Section>
              ))}
              {!items.length && <Text style={styles.note}>Open your cart to review your selected items.</Text>}
              {items.length > 4 && <Text style={styles.remaining}>+ {items.length - 4} more {items.length - 4 === 1 ? "item" : "items"} in your cart</Text>}
              <Hr style={styles.totalDivider} />
              <Row>
                <Column><Text style={styles.totalLabel}>Cart total</Text></Column>
                <Column style={styles.totalColumn}><Text style={styles.total}>{formatMoney(total)}</Text></Column>
              </Row>
            </Section>
            <Section style={styles.action}>
              <Button href={recovery_url} style={styles.button}>Return to my cart</Button>
              <Text style={styles.backupLink}>Button not working? <Link href={recovery_url} style={styles.link}>Open your cart here</Link>.</Text>
            </Section>
            <Section style={styles.notice}>
              <Text style={styles.noticeHeading}>Your private cart link</Text>
              <Text style={styles.note}>{expiration ? `Link expires: ${expiration}.` : "This link is valid for 72 hours from when this reminder was sent."} It can be used once. Please do not share it.</Text>
              <Text style={styles.disclaimer}>Items are not reserved. Final prices, shipping, taxes and availability are confirmed at checkout.</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Need a hand?</Text>
            <Text style={styles.note}>Contact <Link href="mailto:support@petboxnest.com" style={styles.link}>support@petboxnest.com</Link> and our team will be happy to help.</Text>
            <Text style={styles.consent}>You received this email because you opted in to cart reminders at checkout on PetBoxNest.</Text>
            <Text style={styles.unsubscribe}><Link href={unsubscribe_url} style={styles.unsubscribeLink}>Stop cart reminder emails</Link></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: "#FFF8EF", color: "#202433", fontFamily: "Arial, sans-serif", margin: "0", padding: "32px 12px" },
  container: { backgroundColor: "#FFFFFF", border: "1px solid #E6E8EC", borderRadius: "24px", margin: "0 auto", maxWidth: "600px", overflow: "hidden" },
  header: { backgroundColor: "#6557D9", padding: "20px 28px" },
  brand: { color: "#FFFFFF", fontSize: "18px", fontWeight: 700, letterSpacing: "2px", margin: "0" },
  content: { padding: "34px 28px" },
  eyebrow: { color: "#4A3DB8", fontSize: "12px", fontWeight: 700, letterSpacing: "1.6px", margin: "0 0 12px" },
  heading: { fontSize: "28px", lineHeight: "36px", margin: "0 0 14px" },
  copy: { color: "#596071", fontSize: "16px", lineHeight: "26px", margin: "0 0 24px" },
  sectionHeading: { fontSize: "18px", lineHeight: "26px", margin: "0 0 12px" },
  productCard: { border: "1px solid #E6E8EC", borderRadius: "16px", padding: "16px" },
  item: { padding: "10px 0" },
  itemRow: { tableLayout: "fixed" as const, width: "100%" },
  imageColumn: { width: "94px", verticalAlign: "top" },
  image: { display: "block", width: "80px", height: "80px", objectFit: "contain" as const, borderRadius: "10px", backgroundColor: "#FFFFFF" },
  placeholder: { width: "80px", height: "80px", backgroundColor: "#F4F6F8", borderRadius: "10px", textAlign: "center" as const },
  placeholderText: { color: "#596071", fontSize: "11px", lineHeight: "16px", margin: "0" },
  details: { verticalAlign: "top", overflowWrap: "anywhere" as const },
  productTitle: { fontSize: "14px", lineHeight: "21px", fontWeight: 700, margin: "0 0 6px", overflowWrap: "anywhere" as const },
  itemMeta: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "0" },
  remaining: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "12px 0 0" },
  totalDivider: { borderColor: "#E6E8EC", margin: "16px 0" },
  totalLabel: { fontSize: "15px", fontWeight: 700, margin: "0" },
  totalColumn: { textAlign: "right" as const },
  total: { fontSize: "20px", lineHeight: "28px", fontWeight: 700, margin: "0" },
  action: { textAlign: "center" as const, padding: "24px 0 0" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#FFFFFF", display: "inline-block", fontSize: "15px", fontWeight: 700, padding: "14px 26px", textDecoration: "none" },
  backupLink: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "12px 0 24px" },
  link: { color: "#4A3DB8", fontWeight: 700, textDecoration: "underline" },
  notice: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px" },
  noticeHeading: { fontSize: "15px", fontWeight: 700, margin: "0 0 8px" },
  note: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "0" },
  disclaimer: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "12px 0 0" },
  divider: { borderColor: "#E6E8EC", margin: "26px 0 20px" },
  helpHeading: { fontSize: "16px", fontWeight: 700, margin: "0 0 8px" },
  consent: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "24px 0 8px" },
  unsubscribe: { fontSize: "12px", lineHeight: "20px", margin: "0" },
  unsubscribeLink: { color: "#596071", textDecoration: "underline" },
}
