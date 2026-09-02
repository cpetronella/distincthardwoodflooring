import Link from "next/link";

const phoneDisplay = "(917) 887-0192";
const phoneHref = "+19178870192";

export const metadata = {
  title: "Marketing Communications Terms | Distinct Hardwood Flooring",
  description: "Terms for optional email and text marketing from Distinct Hardwood Flooring, Inc.",
};

export default function MarketingCommunicationsTermsPage() {
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
        <h1>Marketing Communications Terms</h1>
        <p className="privacy-intro">These terms apply to the optional email and text message marketing programs offered by Distinct Hardwood Flooring, Inc. ("Distinct," "we," "us," or "our"). Participation is voluntary. Marketing consent is not required to request an estimate, purchase flooring services, or otherwise do business with Distinct.</p>

        <section aria-labelledby="terms-eligibility"><h2 id="terms-eligibility">1. Eligibility</h2><p>Our marketing programs are intended for individuals who are at least 18 years old. By enrolling, you represent that you are at least 18 and that the email address or mobile telephone number you provide belongs to you, or that you are authorized to provide it and consent to communications at that address or number.</p></section>

        <section aria-labelledby="terms-service">
          <h2 id="terms-service">2. Estimate and service communications</h2>
          <p>Marketing communications are separate from communications relating to an estimate, project, transaction, or requested service.</p>
          <p>If you request an estimate or ask us to contact you, Distinct may manually call, text, or email you as reasonably necessary to respond, schedule an appointment, discuss your project, provide an estimate, perform requested services, or communicate about an existing business relationship.</p>
          <p>Opting out of promotional marketing does not prevent us from sending non-marketing communications that are reasonably necessary to respond to a request or provide services you requested.</p>
        </section>

        <section aria-labelledby="terms-email">
          <h2 id="terms-email">3. Email marketing</h2>
          <p>If you separately select the email marketing option, you agree that Distinct Hardwood Flooring, Inc. may send marketing emails to the email address you provide. Messages may include flooring tips, completed-project updates, company news, seasonal information, promotions, discounts, special offers, and information about Distinct's products or services. Email frequency may vary.</p>
          <p>You may unsubscribe at any time using the unsubscribe mechanism in a marketing email or by contacting us. We will honor valid opt-out requests as required by applicable law. You may continue to receive transactional or relationship communications about estimates, projects, purchases, or services you requested.</p>
          <p>Our commercial emails will identify Distinct as the sender, use accurate sender and subject-line information, provide a valid physical postal address, and include a clear method for unsubscribing from future marketing emails.</p>
        </section>

        <section aria-labelledby="terms-text">
          <h2 id="terms-text">4. Text message marketing</h2>
          <p>Text message marketing is optional and requires separate consent.</p>
          <p>By checking the promotional text message consent box and submitting the form, you electronically sign and provide your prior express written consent for Distinct Hardwood Flooring, Inc., directly or through service providers acting on its behalf, to send or cause to be sent recurring marketing and promotional text messages to the mobile telephone number you provide, including messages sent using an automatic telephone dialing system or other automated technology to the extent applicable.</p>
          <p>Messages may include flooring tips, project inspiration, company updates, promotions, discounts, special offers, and information about Distinct's products or services.</p>
          <p><strong>Consent to receive marketing text messages is not required as a condition of requesting an estimate, purchasing any property, goods, or services, or otherwise doing business with Distinct Hardwood Flooring, Inc.</strong></p>
          <p>Message frequency varies. Message and data rates may apply according to your wireless plan.</p>
        </section>

        <section aria-labelledby="terms-help">
          <h2 id="terms-help">5. Text message opt-out and help</h2>
          <p>You may withdraw your consent to promotional text messages at any time. Reply <strong>STOP</strong> to opt out. We will also honor other reasonable communications that clearly indicate that you want promotional text messages to stop.</p>
          <p>Reply <strong>HELP</strong> for assistance, call or text <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>, or email <a href="mailto:jerrydistinct@gmail.com">jerrydistinct@gmail.com</a>. After an opt-out request, we may send one non-promotional text confirming that the request has been processed. We will not continue sending promotional texts unless you later provide new consent.</p>
          <p>An SMS opt-out does not prevent Distinct from manually communicating with you when reasonably necessary regarding an active estimate, project, transaction, or service you requested.</p>
        </section>

        <section aria-labelledby="terms-calls"><h2 id="terms-calls">6. No promotional telephone calling program</h2><p>Distinct does not currently operate a promotional telephone calling or prerecorded-call marketing program. Consent to email or text marketing does not constitute consent to receive automated or prerecorded promotional voice calls. If Distinct establishes such a program in the future, any legally required consent and disclosures will be obtained separately.</p></section>

        <section aria-labelledby="terms-carriers"><h2 id="terms-carriers">7. Wireless carriers</h2><p>Wireless carriers are not responsible for delayed or undelivered messages. Delivery may be affected by your wireless provider, device, coverage, or other circumstances outside Distinct's control.</p></section>

        <section aria-labelledby="terms-providers">
          <h2 id="terms-providers">8. Service providers</h2>
          <p>Distinct may use third-party service providers to operate its website, maintain marketing records, manage email campaigns, or deliver text messages. These providers may process contact information on behalf of Distinct only for the services they provide to Distinct and subject to applicable contractual, privacy, and security requirements.</p>
          <p>Using an email, CRM, hosting, or SMS platform does not change the identity of the business whose products or services are being marketed. Marketing messages under these terms are sent by or on behalf of Distinct Hardwood Flooring, Inc.</p>
        </section>

        <section aria-labelledby="terms-sharing">
          <h2 id="terms-sharing">9. No sale of marketing information</h2>
          <p>Distinct does not sell or rent estimate-request information or marketing contact lists, and does not provide them to third parties for those parties' independent marketing purposes.</p>
          <p>Distinct may provide information to service providers acting on its behalf as reasonably necessary to operate the website, store business records, provide requested services, administer marketing preferences, or deliver communications you authorized. Additional information is available in our <Link href="/privacy">Privacy Notice</Link>.</p>
        </section>

        <section aria-labelledby="terms-accuracy">
          <h2 id="terms-accuracy">10. Marketing accuracy</h2>
          <p>Distinct intends marketing communications to accurately describe its products, services, promotions, and offers. Material conditions, restrictions, expiration dates, eligibility requirements, and other limitations will be disclosed when reasonably necessary to prevent a communication from being misleading.</p>
          <p>Nothing in our marketing communications creates a guarantee regarding pricing, availability, project timing, materials, results, or other services unless expressly stated in writing by Distinct.</p>
        </section>

        <section aria-labelledby="terms-security"><h2 id="terms-security">11. Privacy and security</h2><p>Information collected through our marketing programs is handled in accordance with our <Link href="/privacy">Privacy Notice</Link>. Distinct maintains administrative, technical, and physical safeguards appropriate to the nature of the information it maintains and the size and complexity of its operations. We may require service providers that process protected information on our behalf to maintain appropriate safeguards. No electronic storage or transmission system can be guaranteed to be completely secure.</p></section>

        <section aria-labelledby="terms-records">
          <h2 id="terms-records">12. Marketing records and preferences</h2>
          <p>Distinct may maintain records of marketing consent and preferences, including the contact information provided, date and time of consent, consent language presented, applicable version of these terms, selected marketing channels, and later unsubscribe or opt-out requests.</p>
          <p>These records may be retained as reasonably necessary to demonstrate compliance with applicable law and honor marketing preferences. A limited suppression record may remain after other lead information is deleted so that an opt-out continues to be honored.</p>
        </section>

        <section aria-labelledby="terms-renewal">
          <h2 id="terms-renewal">13. No subscription or automatic renewal</h2>
          <p>Enrollment in our email or text marketing programs is free. Enrollment does not create a paid subscription, recurring service agreement, automatic renewal, recurring charge, or continuous-service arrangement.</p>
          <p>If Distinct offers a paid subscription, automatically renewing service, or continuous-service arrangement in the future, applicable terms and required consent will be presented separately before enrollment or billing.</p>
        </section>

        <section aria-labelledby="terms-changes"><h2 id="terms-changes">14. Changes to these terms</h2><p>We may update these terms to reflect changes in our marketing practices, technology, vendors, or applicable law. The effective date at the top identifies the current version. A change to these terms will not by itself be used to materially expand an individual's marketing consent when additional consent is required by law.</p></section>

        <section aria-labelledby="terms-contact"><h2 id="terms-contact">15. Contact us</h2><p>Questions, marketing preference requests, or opt-out requests may be directed to Distinct Hardwood Flooring, Inc. by calling or texting <a href={`tel:${phoneHref}`}>{phoneDisplay}</a> or emailing <a href="mailto:jerrydistinct@gmail.com">jerrydistinct@gmail.com</a>.</p></section>
      </article>

      <footer className="privacy-footer">
        <p>© {new Date().getFullYear()} Distinct Hardwood Flooring, Inc.</p>
        <div><Link href="/privacy">Privacy Notice</Link><Link href="/">Return to the website</Link></div>
      </footer>
    </main>
  );
}
