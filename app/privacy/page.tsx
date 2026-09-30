import Link from "next/link";

export const metadata = {
  title: "Privacy Notice | Distinct Hardwood Flooring, Inc.",
  description: "How we handle estimate requests, marketing choices, and optional analytics.",
};

export default function PrivacyPage() {
  return <main className="privacy-page">
    <header className="privacy-header">
      <Link href="/" aria-label="Return to Distinct Hardwood Flooring, Inc."><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring, Inc." /></Link>
      <Link href="/#estimate">Request an estimate</Link>
    </header>
    <article className="privacy-content">
      <p>Effective and last updated September 23, 2026</p>
      <h1>Privacy Notice</h1>
      <p className="privacy-intro">Distinct Hardwood Flooring, Inc. serves customers in New York, New Jersey, and Connecticut. This notice explains how we handle information from anyone who visits this website or requests an estimate.</p>

      <section><h2>What we collect and use</h2>
        <p>The estimate form asks for your name, phone number, email, service address, whether you are a homeowner, contractor, or other requester, and optional project type and description. If you choose Other, you describe your role. We use these details to evaluate your request, contact you about it, and manage estimates and projects. We do not ask for a billing address on the current form. Older records may contain billing addresses from an earlier form.</p>
        <p>Our private lead dashboard also stores submission and activity dates, estimate status and price, project status, retention settings, and your separate marketing choices and opt-outs. Our hosting provider processes basic device and request information to deliver and protect the website.</p>
      </section>

      <section><h2>Service contact and optional offers</h2>
        <p>We may call, text, or email you about the estimate you requested. Marketing permission is optional and separate: email and promotional text choices are independent and not preselected. Choosing neither does not affect your estimate or services. We record your choices, the time, and the language shown.</p>
        <p>We are not currently sending promotional email or text campaigns. We will set up opt-out handling before sending any. Read our <Link href="/terms">Marketing Communications Terms</Link>.</p>
      </section>

      <section><h2>Sharing, analytics, and cookies</h2>
        <p>We use Sites hosting, Cloudflare Workers and a Cloudflare D1 database for this website and its private lead records. If you choose Allow analytics, Google Analytics 4 receives limited public-page visits and successful estimate events. We do not send names, contact details, form entries, lead IDs, private dashboard activity, or URL query strings to analytics. We do not use advertising trackers, Google Ads, or remarketing.</p>
        <p>Analytics stays off until you allow it. You can change your choice using Analytics preferences at the bottom of a public page. The choice is stored in your browser; analytics cookies are configured for up to 90 days. Do Not Track or Global Privacy Control keeps analytics off when your browser provides that signal. The dashboard uses an essential secure sign-in cookie.</p>
        <p>Authorized staff may open a service address in Apple Maps. External links have their own privacy practices. We do not sell or rent your contact information for another business&apos;s marketing.</p>
      </section>

      <section><h2>How long we keep information</h2>
        <p>Unconverted estimate leads become eligible for deletion two years after their last meaningful business activity. Active projects are kept while active. Completed projects normally become eligible seven years after project completion. A completed estimate alone does not mean the project is complete. Documented legal, warranty, dispute, or similar holds pause cleanup.</p>
        <p>Cleanup runs in batches, so removal may occur after the eligibility date. Older records without a confirmed project status stay out of automatic cleanup until reviewed. We keep limited email or phone information to honor marketing opt-outs after the rest of a record is deleted. Copies previously exported by staff and historical hosting backups may persist separately.</p>
      </section>

      <section><h2>Your choices and questions</h2>
        <p>To ask about, correct, or request deletion of your information, or to withdraw email or text marketing permission, call <a href="tel:+19178870192">(917) 887-0192</a> or email <a href="mailto:jerrydistinct@gmail.com">jerrydistinct@gmail.com</a>. Tell us which channel you want stopped. We may verify your identity and retain information needed for legal obligations or documented holds. Marketing opt-outs do not prevent us from responding to a service request, but we will respect a specific request to stop using a contact channel.</p>
        <p>We use HTTPS, staff sign-in, access checks, and other safeguards to protect lead records, but no online system is completely secure. Please do not send payment details or sensitive information through the estimate form.</p>
      </section>

      <section><h2>Changes</h2><p>We will update this notice and its date when our practices change. A policy update does not expand your marketing permission.</p></section>
    </article>
    <footer className="privacy-footer"><p>© {new Date().getFullYear()} Distinct Hardwood Flooring, Inc.</p><div><Link href="/terms">Marketing Communications Terms</Link><Link href="/">Return to the website</Link></div></footer>
  </main>;
}
