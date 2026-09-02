import { eq } from "drizzle-orm";
import { hasLeadSession } from "../../../../lib/leads-auth";

const allowedStatuses = new Set(["new-business", "estimate-complete", "missed-opportunity"]);

export async function PATCH(request: Request) {
  if (!(await hasLeadSession())) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { id?: unknown; status?: unknown; estimateAmount?: unknown };
    const id = typeof payload.id === "number" ? payload.id : Number(payload.id);
    const status = typeof payload.status === "string" ? payload.status : "";
    if (!Number.isSafeInteger(id) || id < 1 || !allowedStatuses.has(status)) {
      return Response.json({ error: "Invalid lead update." }, { status: 400 });
    }

    const update: { status: string; estimateAmountCents?: number } = { status };
    if (status === "estimate-complete") {
      const estimateAmount = typeof payload.estimateAmount === "number" ? payload.estimateAmount : Number(payload.estimateAmount);
      if (!Number.isFinite(estimateAmount) || estimateAmount <= 0 || estimateAmount > 10_000_000) {
        return Response.json({ error: "A valid estimate amount is required." }, { status: 400 });
      }
      update.estimateAmountCents = Math.round(estimateAmount * 100);
    }

    const [{ getDb }, { estimates }] = await Promise.all([
      import("../../../../db"),
      import("../../../../db/schema"),
    ]);
    await getDb().update(estimates).set(update).where(eq(estimates.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to update this lead." }, { status: 500 });
  }
}
