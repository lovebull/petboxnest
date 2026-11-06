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
} from "@react-email/components";
import { getAfterSalesUpdateContent, getAfterSalesUpdateLink, type AfterSalesEmailRequest } from "../after-sales-update-content";

export default function AfterSalesUpdateEmail({
  request,
}: {
  request: AfterSalesEmailRequest;
}) {
  const content = getAfterSalesUpdateContent(request);
  const link = getAfterSalesUpdateLink(request, process.env.STOREFRONT_URL || "https://www.petboxnest.com");
  return (
    <Html lang="en">
      <Head>
        <style>{`@media only screen and (max-width: 480px) {
          .after-sales-content { padding: 26px 20px !important; }
          .after-sales-heading { font-size: 26px !important; line-height: 34px !important; }
        }`}</style>
      </Head>
      <Preview>PetBoxNest after-sales update: {content.label}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}><Text style={styles.brand}>PetBoxNest</Text></Section>
          <Section className="after-sales-content" style={styles.content}>
            <Text style={styles.eyebrow}>ORDER CARE UPDATE</Text>
            <Heading className="after-sales-heading" style={styles.heading}>An update on your request.</Heading>
            <Text style={styles.copy}>Your after-sales request has a new status. Here is the latest information and what to do next.</Text>
            <Section style={styles.summary}>
              <Text style={styles.label}>REQUEST NUMBER</Text>
              <Text style={styles.requestNumber}>{request.request_number}</Text>
              {content.typeLabel && <Text style={styles.type}>Request type: {content.typeLabel}</Text>}
              <Text style={styles.statusLabel}>CURRENT STATUS</Text>
              <Text style={styles.status}>{content.label}</Text>
            </Section>
            {request.customer_message?.trim() && (
              <Section style={styles.messageCard}>
                <Heading as="h2" style={styles.subheading}>Message from PetBoxNest</Heading>
                <Text style={styles.message}>{request.customer_message}</Text>
              </Section>
            )}
            <Section style={styles.nextSteps}>
              <Heading as="h2" style={styles.subheading}>What happens next?</Heading>
              <Text style={styles.note}>{content.next}</Text>
            </Section>
            {link ? (
              <Section style={styles.action}>
                <Button href={link.url} style={styles.button}>View request details</Button>
                <Text style={styles.instructions}>{link.instruction}</Text>
                <Text style={styles.linkHelp}>Button not working? Copy and paste this link into your browser:</Text>
                <Text style={styles.backupLink}><Link href={link.url} style={styles.directLink}>{link.url}</Link></Text>
              </Section>
            ) : <Text style={styles.instructions}>Contact our support team with your request number to review the details.</Text>}
            <Hr style={styles.divider} />
            <Heading as="h2" style={styles.helpHeading}>Need a hand?</Heading>
            <Text style={styles.note}>Contact <Link href="mailto:support@petboxnest.com" style={styles.link}>support@petboxnest.com</Link> and include request number {request.request_number} so we can help.</Text>
            <Text style={styles.footer}>This email provides a status update. Review the request timeline and any instructions from our team for the complete details.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#FFF8EF", color: "#202433", fontFamily: "Arial, sans-serif", margin: 0, padding: "32px 12px" },
  container: { backgroundColor: "#FFFFFF", border: "1px solid #E6E8EC", borderRadius: "24px", margin: "0 auto", maxWidth: "600px", overflow: "hidden" },
  header: { backgroundColor: "#6557D9", padding: "20px 28px" },
  brand: { color: "#FFFFFF", fontSize: "18px", fontWeight: 700, letterSpacing: "2px", margin: 0 },
  content: { padding: "34px 28px" },
  eyebrow: { color: "#4A3DB8", fontSize: "12px", fontWeight: 700, letterSpacing: "1.6px", margin: "0 0 12px" },
  heading: { fontSize: "28px", lineHeight: "36px", margin: "0 0 14px" },
  copy: { color: "#596071", fontSize: "16px", lineHeight: "26px", margin: "0 0 24px" },
  summary: { backgroundColor: "#F5F3FF", borderRadius: "16px", padding: "20px" },
  label: { color: "#596071", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", lineHeight: "18px", margin: 0 },
  requestNumber: { fontSize: "18px", lineHeight: "26px", fontWeight: 700, margin: "4px 0 0", overflowWrap: "anywhere" as const },
  type: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "8px 0 0" },
  statusLabel: { color: "#596071", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", lineHeight: "18px", margin: "18px 0 4px" },
  status: { color: "#4A3DB8", fontSize: "20px", fontWeight: 700, lineHeight: "28px", margin: 0 },
  messageCard: { padding: "24px 0 0" },
  subheading: { fontSize: "16px", lineHeight: "24px", margin: "0 0 8px" },
  message: { color: "#596071", fontSize: "14px", lineHeight: "24px", margin: 0, whiteSpace: "pre-wrap" as const, overflowWrap: "anywhere" as const },
  nextSteps: { backgroundColor: "#FFF8EF", borderRadius: "16px", padding: "18px 20px", margin: "24px 0 0" },
  note: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: 0, overflowWrap: "anywhere" as const },
  action: { textAlign: "center" as const, padding: "24px 0 0" },
  button: { backgroundColor: "#6557D9", borderRadius: "12px", color: "#FFFFFF", fontSize: "15px", fontWeight: 700, padding: "14px 24px", textDecoration: "none" },
  instructions: { color: "#596071", fontSize: "13px", lineHeight: "22px", margin: "14px 0 0" },
  linkHelp: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "16px 0 8px" },
  backupLink: { fontSize: "12px", lineHeight: "20px", margin: 0, wordBreak: "break-all" as const },
  directLink: { color: "#4A3DB8", textDecoration: "underline", wordBreak: "break-all" as const },
  divider: { borderColor: "#E6E8EC", margin: "26px 0 20px" },
  helpHeading: { fontSize: "16px", lineHeight: "24px", margin: "0 0 8px" },
  link: { color: "#4A3DB8", fontWeight: 700, textDecoration: "underline" },
  footer: { color: "#596071", fontSize: "12px", lineHeight: "20px", margin: "20px 0 0" },
};
