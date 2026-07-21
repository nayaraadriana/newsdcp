export interface ClickWebhookPayload {
  campaignId: string;
  recipientId: string;
  originalUrl: string;
  linkLabel: string;
  ip: string;
  userAgent: string;
  clickedAt: string; // ISO 8601
}

/**
 * Fires a click event webhook to the configured WEBHOOK_CLICK_URL.
 * Fails silently — webhook errors must never break the tracking redirect.
 */
export async function dispatchClickWebhook(
  payload: ClickWebhookPayload
): Promise<void> {
  const url = process.env.WEBHOOK_CLICK_URL;

  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[WEBHOOK_CLICK] Failed to dispatch:', err);
  }
}
