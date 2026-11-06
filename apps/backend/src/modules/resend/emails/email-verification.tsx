import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type EmailVerificationProps = {
  verification_url: string
  expires_at?: string | Date | null
}

export default function EmailVerificationEmail({
  verification_url,
  expires_at,
}: EmailVerificationProps) {
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
        <style>{`
          @media only screen and (max-width: 480px) {
            .email-verification-content { padding: 26px 20px !important; }
            .email-verification-heading { font-size: 26px !important; line-height: 34px !important; }
          }
        `}</style>
      </Head>
      <Preview>Verify your PetBoxNest email address</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PetBoxNest</Text>
          </Section>
          <Section className="email-verification-content" style={styles.content}>
            <Text style={styles.eyebrow}>ACCOUNT VERIFICATION</Text>
            <Heading className="email-verification-heading" style={styles.heading}>Verify your email address.</Heading>
            <Text style={styles.copy}>
              Confirm your email address to finish creating your PetBoxNest
              account. Select the button below to verify that this email belongs to you.
            </Text>
            <Section style={styles.actionCard}>
              <Text style={styles.actionLabel}>CONFIRM YOUR EMAIL</Text>
              <Button href={verification_url} style={styles.button}>
                Verify my email
              </Button>
              <Text style={styles.expiry}>
                {expiration ? `Link expires: ${expiration}.` : "This verification link expires soon."}
              </Text>
            </Section>
            <Text style={styles.linkHelp}>Button not working? Copy and paste this link into your browser:</Text>
            <Text style={styles.backupLink}>
              <Link href={verification_url} style={styles.verificationLink}>{verification_url}</Link>
            </Text>
            <Text style={styles.linkHelp}>If the link has expired, return to the sign-in page and request a new verification email.</Text>
            <Section style={styles.securityCard}>
              <Text style={styles.securityHeading}>Keep your account secure</Text>
              <Text style={styles.security}>Do not share this verification link with anyone.</Text>
              <Text style={styles.unrequested}>If you did not create a PetBoxNest account, you can safely ignore this message.</Text>
            </Section>
            <Hr style={styles.divider} />
            <Text style={styles.helpHeading}>Need help verifying your email?</Text>
            <Text style={styles.security}>Contact <Link href="mailto:support@petboxnest.com" style={styles.supportLink}>support@petboxnest.com</Link>. Please do not include your password or verification link.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: "#FFF8EF",
    color: "#202433",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: "32px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #E6E8EC",
    borderRadius: "24px",
    margin: "0 auto",
    maxWidth: "600px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#6557D9",
    padding: "20px 28px",
  },
  brand: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "2px",
    margin: 0,
  },
  content: {
    padding: "34px 28px",
  },
  eyebrow: {
    color: "#4A3DB8",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.6px",
    margin: "0 0 12px",
  },
  heading: {
    color: "#202433",
    fontSize: "28px",
    lineHeight: "36px",
    margin: "0 0 14px",
  },
  copy: {
    color: "#596071",
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 26px",
  },
  button: {
    backgroundColor: "#6557D9",
    borderRadius: "12px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "700",
    padding: "13px 22px",
    textDecoration: "none",
  },
  actionCard: { backgroundColor: "#F5F3FF", border: "1px solid #E6E8EC", borderRadius: "16px", padding: "24px 16px", textAlign: "center" as const },
  actionLabel: { color: "#596071", fontSize: "11px", lineHeight: "18px", fontWeight: "700", letterSpacing: "1px", margin: "0 0 16px" },
  expiry: { color: "#4A3DB8", fontSize: "13px", lineHeight: "21px", fontWeight: "700", margin: "14px 0 0" },
  linkHelp: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "16px 0 10px" },
  backupLink: { fontSize: "12px", lineHeight: "20px", margin: "0 0 16px", wordBreak: "break-all" as const },
  verificationLink: { color: "#4A3DB8", textDecoration: "underline", wordBreak: "break-all" as const, overflowWrap: "anywhere" as const },
  securityCard: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px", margin: "24px 0 0" },
  securityHeading: { color: "#202433", fontSize: "15px", fontWeight: "700", margin: "0 0 8px" },
  unrequested: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "12px 0 0" },
  helpHeading: { color: "#202433", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" },
  supportLink: { color: "#4A3DB8", fontWeight: "700", textDecoration: "underline" },
  divider: {
    borderColor: "#E6E8EC",
    margin: "30px 0 20px",
  },
  security: {
    color: "#596071",
    fontSize: "13px",
    lineHeight: "21px",
    margin: 0,
  },
}
