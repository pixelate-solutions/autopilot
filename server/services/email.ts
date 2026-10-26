type EmailInput = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendOperationalEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SUPPORT_EMAIL_FROM ?? "Autopilot <support@autopilothome.com>";

  if (!apiKey) {
    console.info("Email not sent because RESEND_API_KEY is not configured.", input);
    return { id: null, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email send failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<{ id: string }>;
}

export function supportInbox() {
  return process.env.SUPPORT_EMAIL_TO ?? process.env.COMPANY_OWNER_EMAIL ?? companyOwnerFallback();
}

function companyOwnerFallback() {
  return (process.env.COMPANY_OWNER_EMAILS ?? "").split(",")[0]?.trim() || "support@autopilothome.com";
}
