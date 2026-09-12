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

const labels: Record<string, string> = {
  pending_review: "Submitted",
  approved: "Approved",
  rejected: "Not approved",
  awaiting_shipment: "Awaiting return shipment",
  in_transit: "In transit",
  received: "Received",
  processing_refund: "Refund processing",
  refunded: "Refund sent",
  replacement_processing: "Replacement processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function AfterSalesUpdateEmail({
  request,
}: {
  request: {
    request_number: string;
    status: string;
    customer_message?: string | null;
  };
}) {
  const status = labels[request.status] || request.status;
  return (
    <Html lang="en">
      <Head />
      <Preview>PetBoxNest after-sales update: {status}</Preview>
      <Body
        style={{
          backgroundColor: "#FFF8EF",
          fontFamily: "Arial, sans-serif",
          padding: "32px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#fff",
            borderRadius: "24px",
            maxWidth: "560px",
            padding: "32px",
          }}
        >
          <Text style={{ color: "#4A3DB8", fontWeight: 700 }}>
            PETBOXNEST ORDER CARE
          </Text>
          <Heading style={{ color: "#202433" }}>
            Your request is now: {status}
          </Heading>
          <Section
            style={{
              backgroundColor: "#F5F3FF",
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <Text style={{ margin: 0 }}>Request {request.request_number}</Text>
            {request.customer_message && <Text>{request.customer_message}</Text>}
          </Section>
          <Text style={{ color: "#596071" }}>
            Sign in to your account, or use guest order care, to see the
            complete timeline.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
