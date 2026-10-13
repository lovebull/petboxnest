import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { evaluateOrderMilestonesWorkflow } from "@petboxnest/medusa-plugin-sales-analytics/workflows";

export default async function evaluateOrderMilestones({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const { result } = await evaluateOrderMilestonesWorkflow(container).run({
    input: {},
  });

  logger.info(
    `Order milestones evaluated: ${result.order_count} valid orders, ${result.created_count} milestones created.`,
  );
}
