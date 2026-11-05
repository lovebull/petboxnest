import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

type RestockAvailableProps = {
  product_title: string
  variant_title?: string | null
  thumbnail?: string | null
  product_url: string
  unsubscribe_url: string
}

export default function RestockAvailableEmail({ product_title, variant_title, thumbnail, product_url, unsubscribe_url }: RestockAvailableProps) {
  return (
    <Html lang="en">
      <Head>
        <style>{`@media only screen and (max-width: 480px) {
          .restock-content { padding: 26px 20px !important; }
          .restock-heading { font-size: 26px !important; line-height: 34px !important; }
          .restock-image { width: 180px !important; height: 180px !important; }
        }`}</style>
      </Head>
      <Preview>{product_title} is back at PetBoxNest</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PetBoxNest</Text>
          </Section>
          <Section className="restock-content" style={styles.content}>
            <Text style={styles.eyebrow}>BACK IN STOCK</Text>
            <Heading className="restock-heading" style={styles.heading}>Your pick is back.</Heading>
            <Text style={styles.copy}>You asked us to let you know when this option was available again. Good news — it is back in stock.</Text>
            <Section style={styles.productCard}>
              {thumbnail?.trim() ? (
                <Img className="restock-image" src={thumbnail.trim()} alt={product_title} width="200" height="200" style={styles.image} />
              ) : (
                <Section style={styles.placeholder}><Text style={styles.note}>Product image unavailable</Text></Section>
              )}
              <Text style={styles.label}>YOUR SELECTED PRODUCT</Text>
              <Heading as="h2" style={styles.productTitle}>{product_title}</Heading>
              {variant_title && <Text style={styles.variant}>Option: {variant_title}</Text>}
            </Section>
            <Section style={styles.action}>
              <Button href={product_url} style={styles.button}>Shop now</Button>
              <Text style={styles.backupLink}>Or <Link href={product_url} style={styles.link}>view your selected option</Link> on our website.</Text>
            </Section>
            <Section style={styles.availability}>
              <Text style={styles.availabilityHeading}>Availability can change</Text>
              <Text style={styles.note}>This alert does not reserve stock. Please check the product page for the latest availability and price.</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Need help choosing?</Text>
            <Text style={styles.note}>Contact <Link href="mailto:support@petboxnest.com" style={styles.link}>support@petboxnest.com</Link> and our team will be happy to help.</Text>
            <Text style={styles.consent}>You received this email because you requested an availability alert for this product on PetBoxNest.</Text>
            <Text style={styles.unsubscribe}><Link href={unsubscribe_url} style={styles.unsubscribeLink}>Unsubscribe from this alert</Link></Text>
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
  productCard: { border: "1px solid #E6E8EC", borderRadius: "16px", padding: "20px", textAlign: "center" as const },
  image: { display: "block", width: "200px", height: "200px", objectFit: "contain" as const, borderRadius: "12px", backgroundColor: "#FFFFFF", margin: "0 auto 20px" },
  placeholder: { backgroundColor: "#F4F6F8", borderRadius: "12px", padding: "24px 12px", margin: "0 0 20px" },
  label: { color: "#596071", fontSize: "11px", lineHeight: "18px", fontWeight: 700, letterSpacing: "1px", margin: "0" },
  productTitle: { fontSize: "20px", lineHeight: "28px", fontWeight: 700, margin: "8px 0", overflowWrap: "anywhere" as const },
  variant: { color: "#596071", fontSize: "14px", lineHeight: "22px", margin: "0" },
  action: { textAlign: "center" as const, padding: "24px 0 0" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#FFFFFF", display: "inline-block", fontSize: "15px", fontWeight: 700, padding: "14px 30px", textDecoration: "none" },
  backupLink: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "12px 0 24px" },
  link: { color: "#4A3DB8", fontWeight: 700, textDecoration: "underline" },
  availability: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px" },
  availabilityHeading: { fontSize: "15px", fontWeight: 700, margin: "0 0 8px" },
  note: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "0" },
  divider: { borderColor: "#E6E8EC", margin: "26px 0 20px" },
  helpHeading: { fontSize: "16px", fontWeight: 700, margin: "0 0 8px" },
  consent: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "24px 0 8px" },
  unsubscribe: { fontSize: "12px", lineHeight: "20px", margin: "0" },
  unsubscribeLink: { color: "#596071", textDecoration: "underline" },
}
