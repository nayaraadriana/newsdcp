import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ─── Campanhas ──────────────────────────────────────────────────

export async function createCampaign(id: string, name: string, subject: string) {
  await sql`
    INSERT INTO campaigns (id, name, subject)
    VALUES (${id}, ${name}, ${subject})
  `;
}

export async function getCampaigns() {
  const rows = await sql`
    SELECT
      c.*,
      COUNT(DISTINCT r.id)           AS total_sent,
      COUNT(DISTINCT o.recipient_id) AS unique_opens,
      COUNT(DISTINCT k.recipient_id) AS unique_clicks
    FROM campaigns c
    LEFT JOIN recipients r ON r.campaign_id = c.id
    LEFT JOIN opens      o ON o.campaign_id = c.id
    LEFT JOIN clicks     k ON k.campaign_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;
  return rows;
}

export async function getCampaignStats(campaignId: string) {
  const campaign = await sql`
    SELECT * FROM campaigns WHERE id = ${campaignId}
  `;

  const totalSentRows = await sql`
    SELECT COUNT(*) AS count
    FROM recipients
    WHERE campaign_id = ${campaignId}
  `;

  const uniqueOpensRows = await sql`
    SELECT COUNT(DISTINCT recipient_id) AS count
    FROM opens
    WHERE campaign_id = ${campaignId}
  `;

  const totalOpensRows = await sql`
    SELECT COUNT(*) AS count
    FROM opens
    WHERE campaign_id = ${campaignId}
  `;

  const uniqueClicksRows = await sql`
    SELECT COUNT(DISTINCT recipient_id) AS count
    FROM clicks
    WHERE campaign_id = ${campaignId}
  `;

  const topLinks = await sql`
    SELECT original_url, link_label, COUNT(*) AS total_clicks
    FROM clicks
    WHERE campaign_id = ${campaignId}
    GROUP BY original_url, link_label
    ORDER BY total_clicks DESC
    LIMIT 10
  `;

  const recipients = await sql`
    SELECT
      r.id, r.email, r.name, r.sent_at,
      COUNT(DISTINCT o.id)  AS open_count,
      COUNT(DISTINCT k.id)  AS click_count,
      MAX(o.opened_at)      AS last_open,
      MAX(k.clicked_at)     AS last_click
    FROM recipients r
    LEFT JOIN opens  o ON o.recipient_id = r.id
    LEFT JOIN clicks k ON k.recipient_id = r.id
    WHERE r.campaign_id = ${campaignId}
    GROUP BY r.id, r.email, r.name, r.sent_at
    ORDER BY open_count DESC
  `;

  return {
    campaign: campaign[0] ?? null,
    totalSent: Number(totalSentRows[0]?.count ?? 0),
    uniqueOpens: Number(uniqueOpensRows[0]?.count ?? 0),
    totalOpens: Number(totalOpensRows[0]?.count ?? 0),
    uniqueClicks: Number(uniqueClicksRows[0]?.count ?? 0),
    topLinks,
    recipients,
  };
}

// ─── Destinatários ──────────────────────────────────────────────

export async function addRecipient(
  id: string,
  campaignId: string,
  email: string,
  name: string
) {
  await sql`
    INSERT INTO recipients (id, campaign_id, email, name)
    VALUES (${id}, ${campaignId}, ${email}, ${name})
  `;
}

// ─── Eventos ────────────────────────────────────────────────────

export async function registerOpen(
  recipientId: string,
  campaignId: string,
  ip: string,
  userAgent: string
) {
  await sql`
    INSERT INTO opens (recipient_id, campaign_id, ip_address, user_agent)
    VALUES (${recipientId}, ${campaignId}, ${ip}, ${userAgent})
  `;
}

export async function registerClick(
  recipientId: string,
  campaignId: string,
  originalUrl: string,
  linkLabel: string,
  ip: string,
  userAgent: string
) {
  await sql`
    INSERT INTO clicks (recipient_id, campaign_id, original_url, link_label, ip_address, user_agent)
    VALUES (${recipientId}, ${campaignId}, ${originalUrl}, ${linkLabel}, ${ip}, ${userAgent})
  `;
}
