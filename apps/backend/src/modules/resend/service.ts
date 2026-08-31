import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type { ReactNode } from "react"
import { Resend, type CreateEmailOptions } from "resend"

import OrderPlacedEmail from "./emails/order-placed"

type ResendOptions = {
  api_key: string
  from: string
  html_templates?: Record<
    string,
    {
      subject?: string
      content: string
    }
  >
}

type InjectedDependencies = {
  logger: Logger
}

enum Templates {
  ORDER_PLACED = "order-placed",
}

const templates: Partial<Record<Templates, (props: any) => ReactNode>> = {
  [Templates.ORDER_PLACED]: OrderPlacedEmail,
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"

  private readonly resendClient: Resend
  private readonly options: ResendOptions
  private readonly logger: Logger

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the Resend provider options."
      )
    }

    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the Resend provider options."
      )
    }
  }

  private getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content
    }

    return templates[template] ?? null
  }

  private getTemplateSubject(template: Templates) {
    const configuredSubject =
      this.options.html_templates?.[template]?.subject

    if (configuredSubject) {
      return configuredSubject
    }

    switch (template) {
      case Templates.ORDER_PLACED:
        return "Your petboxnest order is confirmed"
      default:
        return "petboxnest notification"
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const templateName = notification.template as Templates
    const template = this.getTemplate(templateName)

    if (!template) {
      this.logger.error(
        `No Resend email template found for "${notification.template}".`
      )
      return {}
    }

    const commonOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(templateName),
    }

    const emailOptions: CreateEmailOptions =
      typeof template === "string"
        ? {
            ...commonOptions,
            html: template,
          }
        : {
            ...commonOptions,
            react: template(notification.data),
          }

    const { data, error } = await this.resendClient.emails.send(emailOptions)

    if (error || !data) {
      this.logger.error(
        `Failed to send Resend email: ${error?.message ?? "unknown error"}`
      )
      return {}
    }

    return { id: data.id }
  }
}

export default ResendNotificationProviderService
