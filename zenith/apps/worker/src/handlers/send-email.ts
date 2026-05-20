import type { JobContext } from './index.js'

export async function handleSendEmail(ctx: JobContext): Promise<void> {
  const payload = ctx.payload as { to: string; subject: string; html: string }
  console.log(`[send-email] Sending to ${payload.to} — subject: ${payload.subject}`)
  // TODO: integrate Resend SDK (packages/email)
}
