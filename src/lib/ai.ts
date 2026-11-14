import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, startOfMonthISO, type PlanKey } from "@/lib/logic";

export class AiError extends Error {}

export async function aiJson<T extends z.ZodType>(opts: {
  supabase: SupabaseClient;
  orgId: string;
  plan: PlanKey;
  system: string;
  prompt: string;
  schema: T;
}): Promise<z.infer<T>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("AI is not configured. Set GEMINI_API_KEY on the server.");

  const { count } = await opts.supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("org_id", opts.orgId)
    .eq("kind", "ai_call")
    .gte("created_at", startOfMonthISO());
  if ((count ?? 0) >= PLANS[opts.plan].ai) {
    throw new AiError(`Monthly AI limit reached for the ${PLANS[opts.plan].label} plan. Upgrade in Billing.`);
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (res.status === 429) throw new AiError("The AI provider is rate limiting requests. Try again shortly.");
  if (!res.ok) throw new AiError(`AI request failed (${res.status}).`);
  const body = await res.json();
  const text: string | undefined = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new AiError("The AI returned no content.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AiError("The AI returned malformed output.");
  }
  const out = opts.schema.safeParse(parsed);
  if (!out.success) throw new AiError("The AI output did not match the expected format.");

  await opts.supabase.from("usage_events").insert({ org_id: opts.orgId, kind: "ai_call" });
  return out.data;
}
