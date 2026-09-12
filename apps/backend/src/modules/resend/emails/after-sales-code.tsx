import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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
      <Head />
      <Preview>Your PetBoxNest return verification code</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PETBOXNEST</Text>
          </Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>GUEST ORDER CARE</Text>
            <Heading style={styles.heading}>Your verification code</Heading>
            <Text style={styles.copy}>
              Use this code to securely access after-sales service for order #
              {order.display_id || "—"}. It expires in 10 minutes.
            </Text>
            <Text style={styles.code}>{code}</Text>
            <Text style={styles.foot}>
              If you did not request this code, you can safely ignore this
              email.
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
    padding: "32px 12px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #E6E8EC",
    borderRadius: "24px",
    maxWidth: "560px",
    overflow: "hidden",
  },
  header: { backgroundColor: "#6557D9", padding: "20px 28px" },
  brand: { color: "#fff", fontWeight: "700", letterSpacing: "2px", margin: 0 },
  content: { padding: "34px 28px" },
  eyebrow: {
    color: "#4A3DB8",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },
  heading: { fontSize: "28px", margin: "8px 0 14px" },
  copy: { color: "#596071", fontSize: "16px", lineHeight: "25px" },
  code: {
    backgroundColor: "#F5F3FF",
    borderRadius: "16px",
    fontSize: "34px",
    fontWeight: "700",
    letterSpacing: "8px",
    padding: "18px",
    textAlign: "center" as const,
  },
  foot: { color: "#596071", fontSize: "13px", marginTop: "24px" },
};
