import { marketingConsentRecord, marketingConsentSource, marketingConsentVersion } from "../../../lib/marketing-consent";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const firstName = clean(payload.firstName, 60);
    const lastName = clean(payload.lastName, 60);
    const name = `${firstName} ${lastName}`.trim();
    const phone = clean(payload.phone, 40);
    const address = clean(payload.address, 240);
    const city = clean(payload.city, 100);
    const state = clean(payload.state, 2).toUpperCase();
    const zipCode = clean(payload.zipCode, 10);
    const billingMatchesService = clean(payload.billingMatchesService, 10) === "yes";
    const billingAddress = billingMatchesService ? address : clean(payload.billingAddress, 240);
    const billingCity = billingMatchesService ? city : clean(payload.billingCity, 100);
    const billingState = billingMatchesService ? state : clean(payload.billingState, 2).toUpperCase();
    const billingZipCode = billingMatchesService ? zipCode : clean(payload.billingZipCode, 10);
    const email = clean(payload.email, 180);
    const consent = clean(payload.consent, 10);
    const emailMarketingConsent = clean(payload.emailMarketingConsent, 10) === "yes";
    const phoneMarketingConsent = clean(payload.phoneMarketingConsent, 10) === "yes";

    if (!firstName || !lastName || !phone || !email || !/^\S+@\S+\.\S+$/.test(email) || !address || !city || !/^[A-Z]{2}$/.test(state) || !/^\d{5}(?:-\d{4})?$/.test(zipCode) || !billingAddress || !billingCity || !/^[A-Z]{2}$/.test(billingState) || !/^\d{5}(?:-\d{4})?$/.test(billingZipCode) || consent !== "yes") {
      return Response.json({ error: "Required estimate details are missing." }, { status: 400 });
    }

    // Keep the Cloudflare runtime binding behind a request-time import so the
    // server artifact can be validated in a standard Node build environment.
    const [{ getDb }, { estimates }] = await Promise.all([
      import("../../../db"),
      import("../../../db/schema"),
    ]);
    const db = getDb();
    const [estimate] = await db
      .insert(estimates)
      .values({
        name,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        email,
        zipCode,
        billingAddress,
        billingCity,
        billingState,
        billingZipCode,
        service: clean(payload.service, 120),
        meetingType: clean(payload.meetingType, 80),
        preferredDate: clean(payload.preferredDate, 20),
        preferredTime: clean(payload.preferredTime, 80),
        details: clean(payload.details, 2000),
        consent: true,
        emailMarketingConsent,
        phoneMarketingConsent,
        marketingConsentCapturedAt: new Date().toISOString(),
        marketingConsentVersion,
        marketingConsentText: marketingConsentRecord,
        marketingConsentSource,
        status: "new-business",
      })
      .returning({ id: estimates.id });

    return Response.json({ id: estimate.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
