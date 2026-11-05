import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

type PasswordResetEmailProps = { reset_url: string }

export default function PasswordResetEmail({ reset_url }: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          @media only screen and (max-width: 480px) {
            .password-reset-content { padding: 26px 20px !important; }
            .password-reset-heading { font-size: 26px !important; line-height: 34px !important; }
          }
        `}</style>
      </Head>
      <Preview>Reset your PetBoxNest password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PETBOXNEST</Text></Section>
          <Section className="password-reset-content" style={styles.content}>
            <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
            <Heading className="password-reset-heading" style={styles.heading}>Reset your password.</Heading>
            <Text style={styles.copy}>We received a request to reset the password for your PetBoxNest account. Use the button below to choose a new password.</Text>
            <Section style={styles.actionCard}>
              <Text style={styles.actionLabel}>PASSWORD RESET</Text>
              <Button href={reset_url} style={styles.button}>Reset my password</Button>
              <Text style={styles.expiry}>This link expires in 15 minutes.</Text>
            </Section>
            <Text style={styles.linkHelp}>Button not working? Copy and paste this link into your browser:</Text>
            <Text style={styles.backupLink}>
              <Link href={reset_url} style={styles.resetLink}>{reset_url}</Link>
            </Text>
            <Text style={styles.linkHelp}>If the link has expired, request a new password reset email from the sign-in page.</Text>
            <Section style={styles.securityCard}>
              <Text style={styles.securityHeading}>Keep this link private</Text>
              <Text style={styles.security}>Do not forward this email or share the reset link with anyone, including anyone claiming to be PetBoxNest support.</Text>
              <Text style={styles.unrequested}>If you did not request this change, you can safely ignore this email. Your password will remain unchanged.</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Need help with your account?</Text>
            <Text style={styles.security}>Contact <Link href="mailto:support@petboxnest.com" style={styles.supportLink}>support@petboxnest.com</Link>. Please do not include your password or reset link.</Text>
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
  actionCard: { backgroundColor: "#F5F3FF", border: "1px solid #E6E8EC", borderRadius: "16px", padding: "24px 16px", textAlign: "center" as const },
  actionLabel: { color: "#596071", fontSize: "11px", lineHeight: "18px", fontWeight: "700", letterSpacing: "1px", margin: "0 0 16px" },
  expiry: { color: "#4A3DB8", fontSize: "13px", lineHeight: "21px", fontWeight: "700", margin: "14px 0 0" },
  linkHelp: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "16px 0 10px" },
  backupLink: { fontSize: "12px", lineHeight: "20px", margin: "0 0 16px", wordBreak: "break-all" as const },
  resetLink: { color: "#4A3DB8", textDecoration: "underline", wordBreak: "break-all" as const, overflowWrap: "anywhere" as const },
  securityCard: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px", margin: "24px 0 0" },
  securityHeading: { color: "#202433", fontSize: "15px", fontWeight: "700", margin: "0 0 8px" },
  unrequested: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "12px 0 0" },
  helpHeading: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" },
  supportLink: { color: "#4A3DB8", fontWeight: "700", textDecoration: "underline" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "700", padding: "13px 22px", textDecoration: "none" },
  divider: { borderColor: "#E6E8EC", margin: "30px 0 20px" },
  security: { color: "#596071", fontSize: "13px", lineHeight: "21px", margin: 0 },
}
