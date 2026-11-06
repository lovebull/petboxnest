type NewsletterConfirmationOptions = {
  confirmUrl: string
  unsubscribeUrl: string
  expiresAt: string
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!)

/** Presentation only: subscription and token handling remain in the collection. */
export function renderNewsletterConfirmation({ confirmUrl, unsubscribeUrl, expiresAt }: NewsletterConfirmationOptions) {
  const date = new Date(expiresAt)
  const expiration = !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", year: "numeric", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(date)
    : null
  const validity = `This confirmation link is valid for 24 hours.${expiration ? ` Link expires: ${expiration}.` : ""}`
  const confirm = escapeHtml(confirmUrl)
  const unsubscribe = escapeHtml(unsubscribeUrl)

  const text = [
    "PetBoxNest — NEWSLETTER CONFIRMATION",
    "Confirm your subscription.",
    "One more step to receive pet-home ideas, new-product announcements and product updates from PetBoxNest.",
    `Confirm subscription: ${confirmUrl}`,
    validity,
    "If the link has expired, return to the PetBoxNest homepage and subscribe again to request a new confirmation email.",
    "If you did not request this subscription, you can safely ignore this email. You will not be subscribed unless you confirm.",
    "Need help? Contact support@petboxnest.com.",
    "You received this email because this address was entered into the PetBoxNest newsletter signup form.",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n\n")

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Confirm your PetBoxNest updates</title>
<style>@media only screen and (max-width:480px){.newsletter-content{padding:26px 20px!important}.newsletter-heading{font-size:26px!important;line-height:34px!important}}</style></head>
<body style="margin:0;padding:32px 12px;background-color:#FFF8EF;color:#202433;font-family:Arial,sans-serif;-webkit-text-size-adjust:100%">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">Confirm your subscription for pet-home ideas and product updates from PetBoxNest.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #E6E8EC;border-radius:24px;overflow:hidden">
<tr><td style="padding:20px 28px;background-color:#6557D9;border-radius:24px 24px 0 0;color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:2px">PetBoxNest</td></tr>
<tr><td class="newsletter-content" style="padding:34px 28px">
<p style="margin:0 0 12px;color:#4A3DB8;font-size:12px;font-weight:700;letter-spacing:1.6px;line-height:20px">NEWSLETTER CONFIRMATION</p>
<h1 class="newsletter-heading" style="margin:0 0 14px;font-size:28px;line-height:36px">Confirm your subscription.</h1>
<p style="margin:0 0 24px;color:#596071;font-size:16px;line-height:26px">One more step to receive pet-home ideas, new-product announcements and product updates from PetBoxNest.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F5F3FF;border-radius:16px"><tr><td align="center" style="padding:24px 18px">
<a href="${confirm}" style="display:inline-block;background-color:#6557D9;border-radius:12px;color:#FFFFFF;padding:14px 24px;font-size:15px;line-height:22px;font-weight:700;text-decoration:none;mso-padding-alt:14px 24px">Confirm subscription</a>
<p style="margin:14px 0 0;color:#596071;font-size:12px;line-height:20px">${escapeHtml(validity)}</p>
</td></tr></table>
<p style="margin:20px 0 8px;color:#596071;font-size:12px;line-height:20px">Button not working? Copy and paste this link into your browser:</p>
<p style="margin:0 0 16px;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere"><a href="${confirm}" style="color:#4A3DB8;text-decoration:underline;word-break:break-all">${confirm}</a></p>
<p style="margin:0 0 24px;color:#596071;font-size:12px;line-height:20px">If the link has expired, return to the PetBoxNest homepage and subscribe again to request a new confirmation email.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF8EF;border-radius:16px"><tr><td style="padding:18px 20px">
<h2 style="margin:0 0 8px;font-size:15px;line-height:23px">Did not request this?</h2>
<p style="margin:0;color:#596071;font-size:13px;line-height:22px">You can safely ignore this email. You will not be subscribed unless you confirm.</p>
</td></tr></table>
<hr style="margin:26px 0 20px;border:0;border-top:1px solid #E6E8EC">
<h2 style="margin:0 0 8px;font-size:16px;line-height:24px">Need a hand?</h2>
<p style="margin:0;color:#596071;font-size:13px;line-height:22px">Contact <a href="mailto:support@petboxnest.com" style="color:#4A3DB8;font-weight:700;text-decoration:underline">support@petboxnest.com</a> and our team will be happy to help.</p>
<p style="margin:24px 0 8px;color:#596071;font-size:12px;line-height:20px">You received this email because this address was entered into the PetBoxNest newsletter signup form.</p>
<p style="margin:0;font-size:12px;line-height:20px"><a href="${unsubscribe}" style="color:#596071;text-decoration:underline">Unsubscribe</a></p>
</td></tr></table>
</td></tr></table></body></html>`

  return { html, text }
}
