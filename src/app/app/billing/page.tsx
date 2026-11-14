import { getCtx } from "@/lib/ctx";
import { PageHead } from "@/components/ui";
import { PLANS, type PlanKey } from "@/lib/logic";

export const metadata = { title: "Billing" };

function link(base: string | undefined, orgId: string, email?: string) {
  if (!base) return null;
  try {
    const u = new URL(base);
    u.searchParams.set("client_reference_id", orgId);
    if (email) u.searchParams.set("prefilled_email", email);
    return u.toString();
  } catch { return null; }
}

export default async function Billing() {
  const { org, user } = await getCtx();
  const links: Record<string, string | null> = {
    growth: link(process.env.NEXT_PUBLIC_PAYMENT_LINK_GROWTH, org.id, user.email),
    scale: link(process.env.NEXT_PUBLIC_PAYMENT_LINK_SCALE, org.id, user.email),
  };
  const current = org.plan;
  return (
    <>
      <PageHead title="Billing" sub={`You are on the ${PLANS[current].label} plan. Subscription status: ${org.subscription_status}.`} />
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanKey[]).map((k) => {
          const p = PLANS[k];
          const l = links[k];
          return (
            <div key={k} className={`card p-5 ${k === current ? "ring-2 ring-brand" : ""}`}>
              <h2 className="font-medium">{p.label}</h2>
              <p className="mt-1 text-2xl font-light">{p.price}</p>
              <p className="mt-2 text-sm text-muted">{p.requests} requests · {p.ai} AI actions / month</p>
              <div className="mt-4">
                {k === current ? <span className="badge bg-brand-soft text-brand-deep">Current plan</span>
                  : k === "free" ? <span className="text-xs text-muted">To downgrade, cancel your subscription with the payment provider. Your plan reverts automatically when cancellation is confirmed.</span>
                  : l ? <a href={l} className="btn-primary">Upgrade to {p.label}</a>
                  : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 max-w-2xl text-sm text-muted">Plans change only after the payment provider confirms payment to our server. Returning from the payment page does not activate anything by itself, so the upgrade can take a minute to appear.</p>
    </>
  );
}
