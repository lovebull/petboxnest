// Resolve from the plugin: pnpm gives backend and plugin separate peer paths.
const coreFlowsPath = require.resolve("@medusajs/medusa/core-flows", {
  paths: [require("node:path").resolve(__dirname, "../../../../sales-analytics-plugin")],
});
jest.doMock(coreFlowsPath, () => ({
  getOrderDetailWorkflow: jest.fn(),
}));

const { getOrderDetailWorkflow } = require(coreFlowsPath);
const { syncOrderProjection } = require("../../../../sales-analytics-plugin/src/workflows/sync-sales-order");

describe("sales order payment projection", () => {
  it.each([
    ["pending", "captured", true],
    ["pending", "partially_captured", true],
    ["pending", "authorized", false],
    ["canceled", "captured", false],
  ])("projects %s/%s with valid=%s", async (status, paymentStatus, valid) => {
    // Raw graph data deliberately contains no computed payment status.
    const graph = jest.fn().mockResolvedValue({ data: [{ id: "order_test" }] });
    const run = jest.fn().mockResolvedValue({
      result: {
        id: "order_test", display_id: 1, status,
        payment_status: paymentStatus, fulfillment_status: "not_fulfilled",
        currency_code: "usd", created_at: "2026-11-02T22:46:12Z",
        original_item_subtotal: 65.98, item_subtotal: 65.98,
        total: 65.98, items: [{ quantity: 1 }],
      },
    });
    jest.mocked(getOrderDetailWorkflow).mockReturnValue({ run } as never);
    const service = {
      listSalesOrderFacts: jest.fn().mockResolvedValue([]),
      createSalesOrderFacts: jest.fn(async (values) => ({ id: "fact_test", ...values })),
      listSalesDailyMetrics: jest.fn().mockResolvedValue([]),
      createSalesDailyMetrics: jest.fn(),
    };
    const container = { resolve: (name: string) => name === "query" ? { graph } : service };
    const fact = await syncOrderProjection(container as never, "order_test");

    expect(run).toHaveBeenCalledWith({ input: {
      order_id: "order_test", fields: expect.arrayContaining(["payment_status", "fulfillment_status"]),
    } });
    expect(fact).toMatchObject({ payment_status: paymentStatus, is_valid: valid, total_sales: 65.98 });
    expect(service.listSalesOrderFacts).toHaveBeenCalledWith(expect.objectContaining({ is_valid: true }));
  });
});
