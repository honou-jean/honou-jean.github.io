// supabase/functions/notify-contact-message/index.ts
//
// Called by a Postgres trigger (via pg_net) whenever a new row is inserted
// into public.contact_messages. Sends the site owner an email through Resend
// so they don't have to open Supabase Studio to see new contact-form
// messages. The row itself is already anti-bot-checked (honeypot + timing
// trap) by the table's insert policy before this ever fires.
//
// Deployed with --no-verify-jwt: the caller is Postgres, not a browser
// session, so there is no user JWT to check. A shared secret header takes
// its place instead.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const WEBHOOK_SECRET = Deno.env.get("CONTACT_WEBHOOK_SECRET");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const NOTIFY_TO = Deno.env.get("CONTACT_NOTIFY_TO") ?? "honou84@gmail.com";

  if (!WEBHOOK_SECRET || !RESEND_API_KEY) {
    console.error("notify-contact-message: missing required environment variables.");
    return jsonResponse(500, { error: "Server misconfiguration." });
  }

  // Never log the actual secret value, only whether it matched.
  const providedSecret = req.headers.get("x-webhook-secret");
  if (providedSecret !== WEBHOOK_SECRET) {
    return jsonResponse(401, { error: "Invalid webhook secret." });
  }

  try {
    const payload = await req.json();
    const record = payload?.record;
    if (!record || typeof record !== "object") {
      return jsonResponse(400, { error: "Missing record in webhook payload." });
    }

    const name = typeof record.name === "string" ? record.name.trim().slice(0, 200) : "";
    const email = typeof record.email === "string" ? record.email.trim().slice(0, 254) : "";
    const rawSubject = typeof record.subject === "string" ? record.subject.trim() : "";
    const subject = rawSubject ? rawSubject.slice(0, 200) : null;
    const message = typeof record.message === "string" ? record.message.trim().slice(0, 4000) : "";

    if (!name || !email || !message) {
      return jsonResponse(400, { error: "Incomplete contact message record." });
    }

    const emailSubject = subject
      ? `Portfolio - nouveau message : ${subject}`
      : `Portfolio - nouveau message de ${name}`;

    const html = [
      `<p><strong>Nom :</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>E-mail :</strong> ${escapeHtml(email)}</p>`,
      subject ? `<p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>` : "",
      `<p><strong>Message :</strong></p>`,
      `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    ].join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        reply_to: email,
        subject: emailSubject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("notify-contact-message: Resend API error.", resendResponse.status, errorBody);
      return jsonResponse(502, { error: "Failed to send notification email." });
    }

    return jsonResponse(200, { sent: true });
  } catch (error) {
    console.error("notify-contact-message: unexpected error.", error);
    return jsonResponse(500, { error: "Unexpected error." });
  }
});
