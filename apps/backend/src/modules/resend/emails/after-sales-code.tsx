import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function AfterSalesCodeEmail({
  code,
  order,
}: {
  code: string;
  order: { display_id?: string | number };
}) {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media only screen and (max-width: 480px) {
            .order-code-content { padding: 26px 20px !important; }
            .order-code-heading { font-size: 26px !important; line-height: 34px !important; }
            .order-code-value { font-size: 34px !important; letter-spacing: 5px !important; }
          }
        `}</style>
      </Head>
      <Preview>Your PetBoxNest return verification code</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PetBoxNest</Text>
          </Section>
          <Section className="order-code-content" style={styles.content}>
            <Text style={styles.eyebrow}>SECURE ORDER ACCESS</Text>
            <Heading className="order-code-heading" style={styles.heading}>Your verification code</Heading>
            <Text style={styles.copy}>
              Enter this code on the PetBoxNest page where you requested it to
              verify access to your order and after-sales services.
            </Text>
            <Section style={styles.orderCard}>
              <Text style={styles.label}>ORDER NUMBER</Text>
              <Text style={styles.orderNumber}>#{order.display_id || "—"}</Text>
            </Section>
            <Section style={styles.codeCard}>
              <Text style={styles.label}>YOUR VERIFICATION CODE</Text>
              <Text className="order-code-value" style={styles.code}>{code}</Text>
              <Text style={styles.expiry}>Valid for 10 minutes.</Text>
            </Section>
            <Text style={styles.instructions}>Copy the code above and enter it in the verification form. If it has expired, request a new code on the website.</Text>
            <Section style={styles.securityCard}>
              <Text style={styles.securityHeading}>Keep your code private</Text>
              <Text style={styles.foot}>Do not share this code with anyone, including anyone claiming to be PetBoxNest support.</Text>
              <Text style={styles.unrequested}>If you did not request this code, you can safely ignore this email.</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Need help with your order?</Text>
            <Text style={styles.foot}>
              Contact <Link href="mailto:support@petboxnest.com" style={styles.link}>support@petboxnest.com</Link>. Please include your order number, but never your verification code.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#FFF8EF",
    color: "#202433",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: "32px 12px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #E6E8EC",
    borderRadius: "24px",
    maxWidth: "560px",
    margin: "0 auto",
    overflow: "hidden",
  },
  header: { backgroundColor: "#6557D9", padding: "20px 28px" },
  brand: { color: "#fff", fontSize: "18px", fontWeight: "700", letterSpacing: "2px", margin: 0 },
  content: { padding: "34px 28px" },
  eyebrow: {
    color: "#4A3DB8",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    margin: "0 0 12px",
  },
  heading: { color: "#202433", fontSize: "28px", lineHeight: "36px", margin: "0 0 14px" },
  copy: { color: "#596071", fontSize: "16px", lineHeight: "25px", margin: "0 0 24px" },
  orderCard: { backgroundColor: "#F4F6F8", borderRadius: "16px", padding: "16px 20px", margin: "0 0 20px" },
  label: { color: "#596071", fontSize: "11px", lineHeight: "18px", fontWeight: "700", letterSpacing: "1px", margin: 0 },
  orderNumber: { color: "#202433", fontSize: "18px", lineHeight: "26px", fontWeight: "700", margin: "4px 0 0", overflowWrap: "anywhere" as const },
  codeCard: { backgroundColor: "#F5F3FF", border: "1px solid #E6E8EC", borderRadius: "16px", padding: "22px 12px", textAlign: "center" as const },
  code: {
    color: "#202433",
    fontFamily: "Consolas, 'Courier New', monospace",
    fontSize: "40px",
    lineHeight: "52px",
    fontWeight: "700",
    letterSpacing: "6px",
    margin: "12px 0",
    whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
  },
  expiry: { color: "#4A3DB8", fontSize: "13px", lineHeight: "21px", fontWeight: "700", margin: 0 },
  instructions: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "16px 0 24px" },
  securityCard: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px" },
  securityHeading: { color: "#202433", fontSize: "15px", fontWeight: "700", margin: "0 0 8px" },
  foot: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: 0 },
  unrequested: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "12px 0 0" },
  divider: { borderColor: "#E6E8EC", margin: "26px 0 20px" },
  helpHeading: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" },
  link: { color: "#4A3DB8", fontWeight: "700", textDecoration: "underline" },
};
