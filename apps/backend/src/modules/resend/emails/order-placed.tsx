import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import type {
  BigNumberValue,
  CustomerDTO,
  OrderDTO,
} from "@medusajs/framework/types"

type OrderPlacedEmailProps = {
  order: OrderDTO & {
    customer?: CustomerDTO
  }
}

const formatPrice = (value: BigNumberValue, currencyCode: string) => {
  const amount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.parseFloat(value?.toString() || "0")

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

export default function OrderPlacedEmail({
  order,
}: OrderPlacedEmailProps) {
  const customerName =
    order.customer?.first_name ||
    order.shipping_address?.first_name ||
    "there"

  return (
    <Html lang="en">
      <Head />
      <Preview>Your petboxnest order is confirmed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PETBOXNEST</Text>
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Thanks for your order, {customerName}.
            </Heading>
            <Text style={styles.copy}>
              We received order #{order.display_id} and will let you know when
              it ships.
            </Text>

            <Hr style={styles.divider} />

            <Heading as="h2" style={styles.subheading}>
              Order summary
            </Heading>

            {order.items?.map((item) => (
              <Row key={item.id} style={styles.item}>
                <Column style={styles.imageColumn}>
                  {item.thumbnail ? (
                    <Img
                      src={item.thumbnail}
                      alt={item.product_title || "Product"}
                      width="72"
                      height="72"
                      style={styles.image}
                    />
                  ) : null}
                </Column>
                <Column>
                  <Text style={styles.itemTitle}>{item.product_title}</Text>
                  <Text style={styles.itemMeta}>
                    {item.variant_title} · Qty {item.quantity}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={styles.price}>
                    {formatPrice(item.total, order.currency_code)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={styles.divider} />

            <Row>
              <Column>
                <Text style={styles.totalLabel}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={styles.total}>
                  {formatPrice(order.total, order.currency_code)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Text style={styles.footer}>
            Questions? Reply to this email and our team will help.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: "#f4f4f1",
    color: "#18181b",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: "32px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "640px",
  },
  header: {
    backgroundColor: "#111827",
    padding: "20px 28px",
  },
  brand: {
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "700",
    letterSpacing: "2px",
    margin: 0,
  },
  content: {
    padding: "32px 28px",
  },
  heading: {
    fontSize: "26px",
    lineHeight: "34px",
    margin: "0 0 12px",
  },
  subheading: {
    fontSize: "18px",
    margin: "0 0 16px",
  },
  copy: {
    color: "#52525b",
    fontSize: "15px",
    lineHeight: "24px",
    margin: 0,
  },
  divider: {
    borderColor: "#e4e4e7",
    margin: "26px 0",
  },
  item: {
    marginBottom: "16px",
  },
  imageColumn: {
    width: "88px",
  },
  image: {
    borderRadius: "6px",
    objectFit: "cover" as const,
  },
  itemTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 5px",
  },
  itemMeta: {
    color: "#71717a",
    fontSize: "13px",
    margin: 0,
  },
  price: {
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
  },
  total: {
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
  },
  footer: {
    color: "#71717a",
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
    padding: "0 28px 28px",
    textAlign: "center" as const,
  },
}
