import { getCtx } from "@/lib/ctx";
import { PageHead } from "@/components/ui";
import { PLANS, type PlanKey } from "@/lib/logic";

export const metadata = { title: "Billing" };

const CHECKOUT: Record<"growth" | "scale", string> = {
  growth: process.env.NEXT_PUBLIC_PAYMENT_LINK_GROWTH || "https://selar.com/47plan?currency=USD",
  scale: process.env.NEXT_PUBLIC_PAYMENT_LINK_SCALE || "https://selar.com/97plan?currency=USD",
};

export default async function Billing() {
  const { org, user } = await getCtx();
  const current = org.plan;
  return (
    <>
      <PageHead title="Billing" sub={`You are on the ${PLANS[current].label} plan. Subscription status: ${org.subscription_status}.`} />
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanKey[]).map((k) => {
          const p = PLANS[k];
          return (
            <div key={k} className={`card p-5 ${k === current ? "ring-2 ring-brand" : ""}`}>
              <h2 className="font-medium">{p.label}</h2>
              <p className="mt-1 text-2xl font-light">{p.price}</p>
              <p className="mt-2 text-sm text-muted">{p.requests.toLocaleString()} requests, {p.ai.toLocaleString()} AI analyses per month</p>
              <div className="mt-4">
                {k === current ? <span className="badge bg-brand-soft text-brand-deep">Current plan</span>
                  : k === "free" ? null
                  : <a href={CHECKOUT[k]} target="_blank" rel="noopener noreferrer" className="btn-primary">Upgrade to {p.label}</a>}
              </div>
            </div>
          );
        })}
      </div>
      <section className="card mt-6 max-w-2xl p-5 text-sm text-muted">
        <p>Checkout opens in a new tab. Pay with <span className="font-medium text-ink">{user.email}</span> so the payment can be matched to this account.</p>
        <p className="mt-2">Your plan changes only after the payment is confirmed. Returning from checkout does not activate anything by itself.</p>
      </section>
    </>
  );
}
