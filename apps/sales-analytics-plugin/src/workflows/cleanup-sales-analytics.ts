import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics";
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service";

const retentionDays = () => {
  const configured = Number(process.env.SALES_ANALYTICS_RETENTION_DAYS || 395);
  return Number.isInteger(configured) && configured >= 30 ? configured : 395;
};

const cleanupAnalyticsEventsStep = createStep(
  "cleanup-sales-analytics-events",
  async (_input: Record<string, never>, { container }) => {
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    const cutoff = new Date(Date.now() - retentionDays() * 86_400_000);
    let deleted = 0;
    while (true) {
      const events = await service.listStorefrontAnalyticsEvents(
        { occurred_at: { $lt: cutoff } },
        { take: 500, select: ["id"] },
      );
      if (!events.length) break;
      await service.deleteStorefrontAnalyticsEvents(
        events.map((event) => event.id),
      );
      deleted += events.length;
    }
    return new StepResponse({
      deleted_events: deleted,
      cutoff: cutoff.toISOString(),
    });
  },
);

const cleanupAnalyticsSessionsStep = createStep(
  "cleanup-sales-analytics-sessions",
  async (_input: Record<string, never>, { container }) => {
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    const cutoff = new Date(Date.now() - retentionDays() * 86_400_000);
    let deleted = 0;
    while (true) {
      const sessions = await service.listStorefrontAnalyticsSessions(
        { last_seen_at: { $lt: cutoff } },
        { take: 500, select: ["id"] },
      );
      if (!sessions.length) break;
      await service.deleteStorefrontAnalyticsSessions(
        sessions.map((session) => session.id),
      );
      deleted += sessions.length;
    }
    return new StepResponse({
      deleted_sessions: deleted,
      cutoff: cutoff.toISOString(),
    });
  },
);

type CleanupSalesAnalyticsResult = {
  events: { deleted_events: number; cutoff: string };
  sessions: { deleted_sessions: number; cutoff: string };
};

export const cleanupSalesAnalyticsWorkflow = createWorkflow<
  Record<string, never>,
  CleanupSalesAnalyticsResult,
  []
>("cleanup-sales-analytics", function () {
  const events = cleanupAnalyticsEventsStep({});
  const sessions = cleanupAnalyticsSessionsStep({});
  return new WorkflowResponse({ events, sessions });
});
