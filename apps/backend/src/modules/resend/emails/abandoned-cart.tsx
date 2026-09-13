import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

export default function AbandonedCartEmail({ items = [], currency_code, total, recovery_url, unsubscribe_url }: any) {
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: String(currency_code || "USD").toUpperCase() }).format(Number(total || 0))
  return <Html lang="en"><Head /><Preview>Your PetBoxNest cart is waiting</Preview>
    <Body style={{ backgroundColor: "#FFF8EF", fontFamily: "Arial, sans-serif", padding: "32px 12px" }}>
      <Container style={{ backgroundColor: "#fff", borderRadius: "24px", maxWidth: "560px", padding: "32px" }}>
        <Text style={{ color: "#5B4BD8", fontWeight: 700 }}>PETBOXNEST CART CARE</Text>
        <Heading style={{ color: "#202433" }}>Still deciding? Your picks are waiting.</Heading>
        <Text style={{ color: "#596071" }}>Use the private link below within 72 hours. It works once, then expires automatically.</Text>
        <Section style={{ backgroundColor: "#F5F3FF", borderRadius: "16px", padding: "18px" }}>
          {items.slice(0, 4).map((item: any) => <Text key={item.id} style={{ margin: "6px 0" }}>{item.quantity} × {item.title}</Text>)}
          <Text style={{ fontWeight: 700 }}>Cart total: {money}</Text>
        </Section>
        <Button href={recovery_url} style={{ backgroundColor: "#202433", borderRadius: "14px", color: "#fff", display: "block", fontWeight: 700, marginTop: "24px", padding: "14px 22px", textAlign: "center" }}>Return to my cart</Button>
        <Text style={{ color: "#7A8090", fontSize: "12px", marginTop: "28px" }}>You opted in to cart reminders at checkout. <a href={unsubscribe_url}>Stop cart reminder emails</a>.</Text>
      </Container>
    </Body>
  </Html>
}
