import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomInt } from "crypto";
import { Resend } from "resend";

const FREE_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "live.com", "icloud.com", "protonmail.com", "ymail.com",
  "yahoo.co.uk", "hotmail.co.uk",
]);

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").toLowerCase().trim();
  if (!email || !email.includes("@") || !email.includes(".")) {
    return Response.json({ error: "Valid email required." }, { status: 400 });
  }

  const domain = email.split("@")[1];
  if (!domain || FREE_DOMAINS.has(domain)) {
    return Response.json({ error: "Please use a work email address." }, { status: 400 });
  }

  const otp = String(randomInt(100_000, 1_000_000));
  const emailHash = hashEmail(email);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const supabase = serverClient();
  const { error: dbError } = await supabase.from("verification_tokens").insert({
    token: otp,
    email_hash: emailHash,
    expires_at: expiresAt,
  });

  if (dbError) {
    console.error("[send-otp] db error:", dbError.message);
    return Response.json({ error: "Failed to create verification token." }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[send-otp] RESEND_API_KEY is not set");
    return Response.json({ error: "Email service is not configured." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: "verify@tankhwameter.com",
    to: email,
    subject: `Your TankhwaMeter verification code: ${otp}`,
    html: `<!DOCTYPE html>
<html lang="en">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8FAFC;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="display:inline-block;background:#EFF6FF;border-radius:100px;padding:8px 20px;color:#2563EB;font-weight:700;font-size:15px;">TankhwaMeter</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px 0;text-align:center;">Your verification code</h1>
    <p style="color:#64748B;text-align:center;margin:0 0 32px 0;font-size:15px;">Use this code to verify your work email.</p>
    <div style="background:#F1F5F9;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
      <span style="font-size:42px;font-weight:800;letter-spacing:10px;color:#0F172A;font-variant-numeric:tabular-nums;">${otp}</span>
    </div>
    <p style="color:#64748B;font-size:13px;text-align:center;margin:0 0 6px 0;">This code expires in <strong>15 minutes</strong>.</p>
    <p style="color:#64748B;font-size:13px;text-align:center;margin:0 0 6px 0;">We will never store or share your email.</p>
    <p style="color:#94A3B8;font-size:12px;text-align:center;margin:28px 0 0 0;">If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>`,
  });

  if (emailError) {
    console.error("[send-otp] email error:", JSON.stringify(emailError));
    const detail = process.env.NODE_ENV === "development" ? ` (${emailError.message})` : "";
    return Response.json({ error: `Failed to send verification email.${detail}` }, { status: 500 });
  }

  return Response.json({ success: true });
}
