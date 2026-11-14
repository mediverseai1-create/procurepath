import assert from "node:assert/strict";
import { requiredApprovalSteps, vendorRisk, scoreBids, matchInvoice } from "../src/lib/logic.ts";

assert.deepEqual(requiredApprovalSteps({ amount: 100, category: "Travel" }), ["manager"]);
assert.deepEqual(requiredApprovalSteps({ amount: 30000, category: "Software" }), ["manager", "finance", "security", "executive"]);
assert.ok(requiredApprovalSteps({ amount: 12000, category: "Legal" }).includes("legal"));
assert.ok(requiredApprovalSteps({ amount: 10, vendorHandlesPii: true }).includes("security"));

const r = vendorRisk({ has_soc2: false, has_dpa: false, handles_pii: true, years_in_business: 1 });
assert.equal(r.score, 90); // 35 no SOC2 + 25 no DPA + 10 PII + 20 new assert.equal(r.tier, "high");
assert.equal(vendorRisk({ has_soc2: true, has_dpa: true, handles_pii: false, years_in_business: 10 }).tier, "low");

const ranked = scoreBids(
  [{ name: "Price", weight: 50 }, { name: "Quality", weight: 50 }],
  [{ id: "a", price: 100, scores: { Quality: 6 } }, { id: "b", price: 200, scores: { Quality: 10 } }],
);
assert.equal(ranked[0].id, "a"); // a: 10*.5+6*.5=8 ; b: 5*.5+10*.5=7.5
assert.equal(ranked[0].total, 8); assert.equal(ranked[1].total, 7.5);

const po = { amount: 1000, received_amount: 1000, status: "open" };
assert.equal(matchInvoice({ invoiceAmount: 1015, invoiceNumber: "1", po, duplicate: false }).ok, true);
assert.equal(matchInvoice({ invoiceAmount: 1100, invoiceNumber: "1", po, duplicate: false }).ok, false);
assert.equal(matchInvoice({ invoiceAmount: 500, invoiceNumber: "1", po, duplicate: true }).ok, false);
assert.equal(matchInvoice({ invoiceAmount: 500, invoiceNumber: "1", po: { ...po, received_amount: 100 }, duplicate: false }).ok, false);
assert.equal(matchInvoice({ invoiceAmount: 500, invoiceNumber: "1", po: null, duplicate: false }).ok, false);
console.log("logic tests passed");
