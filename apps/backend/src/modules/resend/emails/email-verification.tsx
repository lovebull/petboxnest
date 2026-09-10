import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type EmailVerificationProps = {
  verification_url: string
}

export default function EmailVerificationEmail({
  verification_url,
}: EmailVerificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your PetBoxNest email address</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PETBOXNEST</Text>
          </Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>WELCOME TO THE NEST</Text>
            <Heading style={styles.heading}>One quick step, then you&apos;re in.</Heading>
            <Text style={styles.copy}>
              Confirm your email address to finish creating your PetBoxNest
              account. This secure link expires soon and can only be used once.
            </Text>
            <Button href={verification_url} style={styles.button}>
              Verify my email
            </Button>
            <Hr style={styles.divider} />
            <Text style={styles.security}>
              If you didn&apos;t create a PetBoxNest account, you can safely
              ignore this message.
            </Text>
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
