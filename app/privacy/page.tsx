import Link from "next/link";

const phoneDisplay = "(917) 887-0192";
const phoneHref = "+19178870192";

export const metadata = {
  title: "Privacy Notice | Distinct Hardwood Flooring",
  description: "How Distinct Hardwood Flooring collects and uses information submitted through estimate requests.",
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <Link href="/" aria-label="Return to Distinct Hardwood Flooring">
          <img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" />
        </Link>
        <Link href="/#estimate">Request an estimate</Link>
      </header>

      <article className="privacy-content">
        <p>Effective September 1, 2026</p>
        <h1>Privacy Notice</h1>
        <p className="privacy-intro">This notice explains how Distinct Hardwood Flooring, Inc. uses the information people provide when requesting an estimate through this website. It reflects how the site and owner dashboard are used today.</p>

        <section aria-labelledby="privacy-collect">
          <h2 id="privacy-collect">Information we collect</h2>
          <p>When you request an estimate, we collect the information you choose to provide, including:</p>
          <ul>
            <li>Your first and last name</li>
            <li>Your phone number and email address</li>
            <li>The service address and, when different, the billing address</li>
            <li>Your selected project type</li>
            <li>Your consent to be contacted about the request</li>
            <li>Your separate choices about promotional email and promotional text messages</li>
          </ul>
          <p>The owner dashboard also stores the submission time, lead status, estimate price, the marketing choices presented with your request, the date those choices were recorded, the consent disclosure and form source presented at submission, and any later unsubscribe request.</p>
        </section>

        <section aria-labelledby="privacy-use">
          <h2 id="privacy-use">How we use your information</h2>
          <p>We use this information to respond to your request, call, text, or email you about the project, schedule and prepare an estimate, provide requested flooring services, maintain business records, and protect the website from misuse.</p>
          <p>If you separately choose to receive marketing, we may also use your email address or phone number to send flooring tips, company updates, special offers, or other promotions through the channel or channels you selected. Marketing permission is optional and is not required to request an estimate or purchase services.</p>
        </section>

        <section aria-labelledby="privacy-sharing">
          <h2 id="privacy-sharing">How information may be shared</h2>
          <p>Distinct Hardwood Flooring, Inc. does not sell or rent estimate-request information or marketing contact lists, and does not provide them to third parties for those parties' independent marketing purposes.</p>
          <p>Information may be processed by service providers acting on our behalf to host the website, store lead records, administer marketing preferences, or help deliver email or text messages. These providers may use the information only to provide services to Distinct and remain subject to applicable contractual, privacy, and security requirements.</p>
          <p>Distinct may also intentionally transfer a customer contact to tools used to manage a requested project, such as Apple Contacts, Joist, or a mapping service. The website does not automatically create a Joist customer record.</p>
        </section>

        <section aria-labelledby="privacy-retention">
          <h2 id="privacy-retention">How long we keep information</h2>
          <p>We keep estimate and customer information only as long as reasonably needed to respond, manage the project, provide services, maintain appropriate business records, demonstrate marketing consent, honor marketing preferences, or meet legal obligations. An authorized owner can delete a lead from the private dashboard when it is no longer needed.</p>
          <p>When a person has opted out of marketing, we may retain a limited suppression record, such as the email address or phone number, marketing channel, and opt-out date, after other lead information is deleted. This record is used only to continue honoring the opt-out and meet compliance obligations.</p>
        </section>

        <section aria-labelledby="privacy-security">
          <h2 id="privacy-security">Security and cookies</h2>
          <p>We use reasonable administrative, technical, and physical measures appropriate to the information we maintain and the size and complexity of our operations. We also require service providers that handle protected information on our behalf to maintain appropriate safeguards. No online system can guarantee absolute security.</p>
          <p>This site uses Google Analytics to understand website visits and improve the estimate-request experience. Google Analytics may use cookies or similar technologies and may collect information such as pages viewed, approximate location, device information, and referring website. Google processes that information under its own terms and privacy policy. This site does not intentionally use advertising or marketing cookies. The private owner dashboard uses an essential sign-in cookie so Distinct Hardwood Flooring, Inc. can securely access lead information.</p>
        </section>

        <section aria-labelledby="privacy-choices">
          <h2 id="privacy-choices">Your choices</h2>
          <p>You may ask about, correct, or request deletion of information you submitted by calling or texting <a href={`tel:${phoneHref}`}>{phoneDisplay}</a> or emailing <a href="mailto:jerrydistinct@gmail.com">jerrydistinct@gmail.com</a>. Some information may be retained when reasonably necessary for business or legal records.</p>
          <p>You may unsubscribe from promotional email using the unsubscribe option in the message or by contacting us. You may opt out of promotional text messages at any time by replying STOP to a text or contacting us. An unsubscribe request does not prevent us from responding to an active estimate or communicating about services you requested.</p>
        </section>

        <section aria-labelledby="privacy-updates">
          <h2 id="privacy-updates">Updates to this notice</h2>
          <p>We may update this notice when the website or our information practices change. The effective date at the top of this page will show when it was last updated.</p>
        </section>

        <p className="privacy-updated">Questions about this notice? Call or text <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>.</p>
      </article>

      <footer className="privacy-footer">
        <p>© {new Date().getFullYear()} Distinct Hardwood Flooring, Inc.</p>
        <div><Link href="/terms">Marketing Communications Terms</Link><Link href="/">Return to the website</Link></div>
      </footer>
    </main>
  );
}
