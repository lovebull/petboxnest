import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components"

export default function RestockAvailableEmail({ product_title, variant_title, thumbnail, product_url, unsubscribe_url }: any) {
  return <Html lang="en"><Head /><Preview>{product_title} is back at PetBoxNest</Preview>
    <Body style={{ backgroundColor: "#FFF8EF", fontFamily: "Arial, sans-serif", padding: "32px 12px" }}>
      <Container style={{ backgroundColor: "#fff", borderRadius: "24px", maxWidth: "560px", padding: "32px" }}>
        <Text style={{ color: "#5B4BD8", fontWeight: 700 }}>PETBOXNEST RESTOCK ALERT</Text>
        <Heading style={{ color: "#202433" }}>A favorite is back in stock</Heading>
        {thumbnail && <Img src={thumbnail} alt="" width="180" style={{ borderRadius: "18px", margin: "20px auto" }} />}
        <Section style={{ backgroundColor: "#F5F3FF", borderRadius: "16px", padding: "18px" }}>
          <Text style={{ fontWeight: 700, margin: 0 }}>{product_title}</Text>
          {variant_title && <Text style={{ color: "#596071", marginBottom: 0 }}>{variant_title}</Text>}
        </Section>
        <Button href={product_url} style={{ backgroundColor: "#202433", borderRadius: "14px", color: "#fff", display: "block", fontWeight: 700, marginTop: "24px", padding: "14px 22px", textAlign: "center" }}>Shop now</Button>
        <Text style={{ color: "#7A8090", fontSize: "12px", marginTop: "28px" }}>You requested this alert on PetBoxNest. <a href={unsubscribe_url}>Unsubscribe from this alert</a>.</Text>
      </Container>
    </Body>
  </Html>
}
