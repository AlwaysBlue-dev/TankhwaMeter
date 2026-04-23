import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

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
  let body: { email?: unknown; otp?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ verified: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").toLowerCase().trim();
  const otp   = String(body.otp   ?? "").trim();

  if (!email || !otp) {
    return Response.json({ verified: false, error: "Email and code required." }, { status: 400 });
  }

  const emailHash = hashEmail(email);
  const supabase  = serverClient();

  const { data: token, error: fetchError } = await supabase
    .from("verification_tokens")
    .select("id, token, expires_at, used")
    .eq("email_hash", emailHash)
    .eq("token", otp)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !token) {
    return Response.json({ verified: false, error: "Incorrect code. Please try again." });
  }

  if (new Date(token.expires_at) < new Date()) {
    return Response.json({ verified: false, error: "Code expired. Please request a new one." });
  }

  const { error: updateError } = await supabase
    .from("verification_tokens")
    .update({ used: true })
    .eq("id", token.id);

  if (updateError) {
    console.error("[confirm-otp] update error:", updateError.message);
    return Response.json({ verified: false, error: "Verification failed. Please try again." });
  }

  const domain = email.split("@")[1];
  return Response.json({ verified: true, domain });
}
