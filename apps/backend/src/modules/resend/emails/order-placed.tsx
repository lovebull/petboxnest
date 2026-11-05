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
      <Head>
        <style>{`
          @media only screen and (max-width: 480px) {
            .order-email-content { padding: 24px 16px !important; }
            .order-product-image { width: 64px !important; height: 64px !important; }
            .order-product-image-column { width: 76px !important; }
            .order-product-meta, .order-product-price { display: block !important; width: 100% !important; text-align: left !important; }
            .order-product-price { padding-top: 6px !important; }
          }
        `}</style>
      </Head>
      <Preview>Your petboxnest order is confirmed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>PETBOXNEST</Text>
          </Section>

          <Section className="order-email-content" style={styles.content}>
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
              <Section key={item.id} style={styles.item}>
                <Row>
                <Column className="order-product-image-column" style={styles.imageColumn}>
                  {item.thumbnail ? (
                    <Img
                      className="order-product-image"
                      src={item.thumbnail}
                      alt={item.product_title || item.title || "Product"}
                      width="80"
                      height="80"
                      style={styles.image}
                    />
                  ) : (
                    <div className="order-product-image" style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderText}>No image<br />available</Text>
                    </div>
                  )}
                </Column>
                <Column style={styles.descriptionColumn}>
                  <Text style={styles.itemTitle}>
                    {item.product_title || item.title || "Product"}
                  </Text>
                  <Row>
                    <Column className="order-product-meta" style={styles.descriptionColumn}>
                      {item.variant_title && <Text style={styles.itemMeta}>{item.variant_title}</Text>}
                      <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
                    </Column>
                    <Column className="order-product-price" align="right" style={styles.priceColumn}>
                      <Text style={styles.price}>
                        {formatPrice(item.total, order.currency_code)}
                      </Text>
                    </Column>
                  </Row>
                </Column>
              </Row>
              </Section>
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
    backgroundColor: "#FFF8EF",
    color: "#202433",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: "32px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "640px",
    border: "1px solid #E6E8EC",
    borderRadius: "20px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#6557D9",
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
    borderBottom: "1px solid #E6E8EC",
    padding: "16px 0",
  },
  imageColumn: {
    width: "96px",
    verticalAlign: "top",
  },
  image: {
    display: "block",
    width: "80px",
    height: "80px",
    border: "1px solid #E6E8EC",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    objectFit: "contain" as const,
  },
  imagePlaceholder: {
    width: "80px",
    height: "80px",
    backgroundColor: "#F4F6F8",
    borderRadius: "12px",
    overflow: "hidden",
  },
  placeholderText: {
    color: "#596071",
    fontSize: "11px",
    lineHeight: "16px",
    padding: "12px 4px",
    textAlign: "center" as const,
    margin: 0,
  },
  descriptionColumn: {
    verticalAlign: "top",
    overflowWrap: "anywhere" as const,
  },
  priceColumn: {
    width: "88px",
    verticalAlign: "bottom",
    whiteSpace: "nowrap" as const,
  },
  itemTitle: {
    color: "#202433",
    fontSize: "15px",
    lineHeight: "22px",
    fontWeight: "700",
    margin: "0 0 6px",
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
