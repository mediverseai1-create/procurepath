import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanKey } from "@/lib/logic";

export async function getCtx() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: mem } = await supabase
    .from("memberships")
    .select("role, organizations(id, name, plan, subscription_status)")
    .eq("user_id", data.user.id)
    .limit(1)
    .single();
  const org = (Array.isArray(mem?.organizations) ? mem?.organizations[0] : mem?.organizations) as
    | { id: string; name: string; plan: PlanKey; subscription_status: string }
    | undefined;
  if (!mem || !org) redirect("/login?error=noorg");
  return { supabase, user: data.user, org, role: mem.role as string, plan: PLANS[org.plan] ?? PLANS.free };
}
