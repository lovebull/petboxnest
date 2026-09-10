import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

type PasswordResetEmailProps = { reset_url: string }

export default function PasswordResetEmail({ reset_url }: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your PetBoxNest password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST</Text></Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
            <Heading style={styles.heading}>Let&apos;s get you back into the nest.</Heading>
            <Text style={styles.copy}>We received a request to reset your PetBoxNest password. This secure link expires in 15 minutes and can only be used once.</Text>
            <Button href={reset_url} style={styles.button}>Reset my password</Button>
            <Hr style={styles.divider} />
            <Text style={styles.security}>If you didn&apos;t request this change, you can safely ignore this email. Your password will remain unchanged.</Text>
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
  copy: { color: "#596071", fontSize: "16px", lineHeight: "26px", margin: "0 0 26px" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "13px 22px", textDecoration: "none" },
  divider: { borderColor: "#E6E8EC", margin: "30px 0 20px" },
  security: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: 0 },
}
