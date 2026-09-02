"use client";

import { FormEvent, KeyboardEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { Building2, CheckCircle2, Hammer, Paintbrush, Trophy } from "lucide-react";
import { emailMarketingDisclosure, marketingCertification, textMarketingDisclosure } from "../lib/marketing-consent";

const instagram = "https://www.instagram.com/jerrydistinct/";
const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

const projects = [
  {
    image: "/carousel-staircase.webp",
    label: "Residential stairway",
    title: "Rich hardwood details from floor to staircase",
    position: "center bottom",
  },
  {
    image: "/carousel-grand-room.webp",
    label: "Residential installation",
    title: "Warm hardwood, made for a grand room",
    position: "center bottom",
  },
  {
    image: "/carousel-dark-oak.webp",
    label: "Residential flooring",
    title: "Dark oak with depth and natural character",
    position: "center bottom",
  },
  {
    image: "/carousel-notre-dame.webp",
    label: "Gymnasium flooring",
    title: "Custom court finishes with school pride built in",
    position: "center center",
  },
];

const services = [
  ["Custom installation", "Tailored hardwood layouts, from timeless straight runs to detailed borders and custom patterns."],
  ["Sanding & refinishing", "Thoughtful preparation, professional sanding, custom stain, and a finish made to endure."],
  ["Commercial flooring", "Reliable, high-quality work for businesses, institutions, and high-traffic environments."],
  ["Gymnasium floors", "Installation and refinishing for courts, including game lines, lettering, and custom logos."],
];

const serviceIcons = [Hammer, Paintbrush, Building2, Trophy];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [billingMatchesService, setBillingMatchesService] = useState(true);
  const [activeProject, setActiveProject] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragPointerId = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const successDialog = useRef<HTMLDialogElement>(null);
  const successPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = window.setTimeout(() => {
      setActiveProject((current) => (current + 1) % projects.length);
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [activeProject, carouselPaused]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectReducedMotion = () => setCarouselPaused(reducedMotion.matches);
    respectReducedMotion();
    reducedMotion.addEventListener("change", respectReducedMotion);
    return () => reducedMotion.removeEventListener("change", respectReducedMotion);
  }, []);

  useEffect(() => {
    const dialog = successDialog.current;
    if (!dialog) return;

    if (successModalOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!successModalOpen && dialog.open) {
      dialog.close();
    }
  }, [successModalOpen]);

  async function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus("sending");
    const form = event.currentTarget;

    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      if (!response.ok) throw new Error("Unable to submit estimate");
      form.reset();
      setBillingMatchesService(true);
      setFormStatus("success");
      setSuccessModalOpen(true);
    } catch {
      setFormStatus("error");
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function closeSuccessModal() {
    setSuccessModalOpen(false);
    window.setTimeout(() => successPanel.current?.focus(), 0);
  }

  function startAnotherEstimate() {
    setFormStatus("idle");
    setSuccessModalOpen(false);
  }

  function showProject(index: number) {
    setActiveProject((index + projects.length) % projects.length);
  }

  function showPreviousProject() {
    showProject(activeProject - 1);
  }

  function showNextProject() {
    showProject(activeProject + 1);
  }

  function handleProjectKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousProject();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextProject();
    }
  }

  function handleProjectPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragStartX.current = event.clientX;
    dragPointerId.current = event.pointerId;
    dragMoved.current = false;
    setCarouselPaused(true);
    setIsDragging(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in every browser context.
    }
  }

  function handleProjectPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragPointerId.current !== event.pointerId || dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    if (Math.abs(distance) > 6) dragMoved.current = true;
    if (dragMoved.current) {
      event.preventDefault();
      setDragOffset(distance);
    }
  }

  function finishProjectDrag(event: PointerEvent<HTMLDivElement>, commitSwipe: boolean) {
    if (dragPointerId.current !== event.pointerId || dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    const shouldChangeProject = commitSwipe && dragMoved.current && Math.abs(distance) >= 48;
    dragStartX.current = null;
    dragPointerId.current = null;
    dragMoved.current = false;
    setDragOffset(0);
    setIsDragging(false);
    setCarouselPaused(false);
    if (shouldChangeProject) {
      if (distance > 0) showPreviousProject();
      else showNextProject();
    }
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  }

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Distinct Hardwood Flooring home">
          <img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring, established 1993" />
        </a>
        <button className="menu-button" type="button" aria-label="Toggle navigation" aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span />
        </button>
        <nav id="main-navigation" className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
          <a href="#gallery" onClick={closeMenu}>Gallery</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a className="button button-olive nav-cta" href="#estimate" onClick={closeMenu}>Book an estimate</a>
        </nav>
      </header>

      <section className="quote-hero" id="estimate" aria-labelledby="hero-title">
        <div className="quote-hero-image" role="img" aria-label="A sunlit room with newly finished white oak hardwood floors" />
        <div className="quote-card">
          <h1 id="hero-title">Beautiful floors.<br />Built to last.</h1>
          <p className="quote-copy">Premium hardwood flooring, professionally installed with precision and care.</p>
          <div className="quote-rule" />
          <p className="form-kicker">Tell us about your project</p>
          {formStatus === "success" ? (
            <div className="estimate-success-panel" ref={successPanel} tabIndex={-1} aria-labelledby="estimate-success-title">
              <CheckCircle2 aria-hidden="true" />
              <p className="form-kicker">Request received</p>
              <h2 id="estimate-success-title">We have your details.</h2>
              <p>Thank you for reaching out. Distinct Hardwood Flooring, Inc. will call or text you within 24–48 business hours to discuss your project.</p>
              <div className="success-panel-actions">
                <button className="button button-olive" type="button" onClick={startAnotherEstimate}>Submit another request</button>
              </div>
            </div>
          ) : <form className="estimate-form top-estimate-form" onSubmit={submitEstimate}>
            <div className="form-grid"><label><span>First name *</span><input name="firstName" autoComplete="given-name" required /></label><label><span>Last name *</span><input name="lastName" autoComplete="family-name" required /></label><label><span>Phone *</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" required /></label><label><span>Email *</span><input name="email" type="email" inputMode="email" autoComplete="email" required /></label><label className="full-width"><span>Service street address *</span><input name="address" autoComplete="shipping address-line1" required /></label><fieldset className="location-grid full-width"><legend>Service location *</legend><label><span>City *</span><input name="city" autoComplete="shipping address-level2" required /></label><label><span>State *</span><select name="state" autoComplete="shipping address-level1" defaultValue="" required><option value="" disabled>Select</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label><label><span>ZIP *</span><input name="zipCode" autoComplete="shipping postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" title="Use a 5-digit ZIP code or ZIP+4" required /></label></fieldset></div>
            <label className="consent address-match"><input name="billingMatchesService" type="checkbox" value="yes" checked={billingMatchesService} onChange={(event) => setBillingMatchesService(event.target.checked)} /><span>Billing address is the same as the service address.</span></label>
            {!billingMatchesService && <fieldset className="billing-fields"><legend>Billing address</legend><label><span>Street address *</span><input name="billingAddress" autoComplete="billing address-line1" required /></label><div className="location-grid"><label><span>City *</span><input name="billingCity" autoComplete="billing address-level2" required /></label><label><span>State *</span><select name="billingState" autoComplete="billing address-level1" defaultValue="" required><option value="" disabled>Select</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label><label><span>ZIP *</span><input name="billingZipCode" autoComplete="billing postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" title="Use a 5-digit ZIP code or ZIP+4" required /></label></div></fieldset>}
            <label><span>Project type (optional)</span><select name="service" defaultValue=""><option value="" disabled>Select the closest fit</option><option>New hardwood installation</option><option>Sanding and refinishing</option><option>Gymnasium flooring</option><option>Commercial flooring</option><option>Not sure yet</option></select></label>
            <label className="consent"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted by call, text, or email about this estimate.</span></label>
            <fieldset className="marketing-consent-group">
              <legend>Keep in touch <span>(optional)</span></legend>
              <p>Choose either option, both, or neither. Your choices will not affect your estimate request or your ability to purchase services.</p>
              <label className="consent"><input name="emailMarketingConsent" type="checkbox" value="yes" /><span>{emailMarketingDisclosure}</span></label>
              <label className="consent"><input name="phoneMarketingConsent" type="checkbox" value="yes" /><span>{textMarketingDisclosure}</span></label>
              <p className="sms-consent-links"><a href="/terms">Marketing Communications Terms</a><span aria-hidden="true">·</span><a href="/privacy">Privacy Notice</a></p>
            </fieldset>
            <p className="privacy-note">We use your information to respond to your request and, only if selected above, send promotions through your chosen channels. {marketingCertification} Read our <a href="/privacy">Privacy Notice</a> and <a href="/terms">Marketing Communications Terms</a>.</p>
            <input type="hidden" name="source" value="Top estimate form" />
            <div className="quote-contact-actions"><button className="button button-olive quote-submit" type="submit" disabled={formStatus === "sending"}>{formStatus === "sending" ? "Sending…" : "Request my free estimate"}</button></div>
            <p className="form-reassurance">After you submit, expect a call or text from Distinct Hardwood Flooring, Inc. within 24–48 business hours.</p>
          </form>}
          <div className="quick-form-message" aria-live="polite">{formStatus === "error" && <p>We could not send your request. Please review the form and try again.</p>}</div>
        </div>
      </section>

      <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div className="gallery-heading"><h2 id="gallery-title">A floor changes<br />the whole room.</h2><p>From homes and businesses to full athletic facilities, every project starts by listening closely and bringing the right material, finish, and level of care to the details.</p></div>
        <div className="project-carousel" role="region" aria-roledescription="carousel" aria-label="Selected work projects">
          <div className={isDragging ? "project-viewport is-dragging" : "project-viewport"} tabIndex={0} onKeyDown={handleProjectKeyDown} onFocus={() => setCarouselPaused(true)} onBlur={() => setCarouselPaused(false)} onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} onPointerDown={handleProjectPointerDown} onPointerMove={handleProjectPointerMove} onPointerUp={(event) => finishProjectDrag(event, true)} onPointerCancel={(event) => finishProjectDrag(event, false)}>
            <div className={isDragging ? "project-track is-dragging" : "project-track"} style={{ transform: `translate3d(calc(-${activeProject * 100}% + ${dragOffset}px), 0, 0)` }}>
              {projects.map((project, index) => <article className="project-card" key={project.title} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${projects.length}`} aria-hidden={activeProject !== index}>
                <div className="project-image"><img src={project.image} alt={`${project.title} by Distinct Hardwood Flooring`} draggable={false} loading="lazy" decoding="async" style={{ objectPosition: project.position }} /></div>
                <p>{project.label}</p><h3>{project.title}</h3>
              </article>)}
            </div>
          </div>
          <div className="carousel-controls">
            <div className="carousel-arrows" aria-label="Change project">
              <button className="carousel-button" type="button" onClick={showPreviousProject} aria-label="Previous project"><span aria-hidden="true">←</span><span>Previous</span></button>
              <button className="carousel-button" type="button" onClick={showNextProject} aria-label="Next project"><span>Next</span><span aria-hidden="true">→</span></button>
            </div>
            <div className="carousel-dots" aria-label="Choose a project">
              {projects.map((project, index) => <button className={activeProject === index ? "carousel-dot is-active" : "carousel-dot"} type="button" key={project.title} onClick={() => showProject(index)} aria-label={`Show ${project.label.toLowerCase()} project`} aria-current={activeProject === index ? "true" : undefined} />)}
            </div>
            <button className="carousel-toggle" type="button" onClick={() => setCarouselPaused((paused) => !paused)} aria-pressed={carouselPaused} aria-label={carouselPaused ? "Play project carousel" : "Pause project carousel"}>{carouselPaused ? "Play" : "Pause"}</button>
          </div>
        </div>
        <a className="underlined-link" href={instagram} target="_blank" rel="noreferrer">View more work on Instagram <span aria-hidden="true">↗</span></a>
      </section>

      <section className="services-section" id="services" aria-labelledby="services-title">
        <div className="services-intro"><h2 id="services-title">One craft.<br />Every kind<br />of floor.</h2><p>From one room to a full athletic facility, each project gets the same commitment to preparation, detail, and finish.</p></div>
        <div className="service-grid">
          {services.map(([title, copy], index) => {
            const Icon = serviceIcons[index];
            return (
              <article className="service-card" key={title}>
                <span className="service-icon" aria-hidden="true"><Icon strokeWidth={1.55} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <div className="about-image" role="img" aria-label="A flooring professional working on a custom gymnasium court" />
        <div className="about-content"><h2 id="about-title">Crafted by hand.<br />Built on trust.</h2><p>Distinct Hardwood Flooring, Inc. was founded in 1993 with a simple idea: do the work carefully, stand behind it, and treat every project with real attention to detail.</p><p>More than three decades later, the company remains personally invested in the work, from the first conversation through the final finish.</p><p className="about-history">Distinct Hardwood Flooring, Inc. serves residential spaces, commercial environments, and gymnasiums throughout New York.</p><a className="underlined-link" href="#estimate">Start your project <span aria-hidden="true">→</span></a></div>
      </section>

      <section className="next-steps-section" aria-labelledby="next-steps-title">
        <div><h2 id="next-steps-title">A clear, simple<br />next step.</h2></div>
        <div className="next-steps"><article><h3>We review your project</h3><p>We look over your details and make sure we understand what you need.</p></article><article><h3>We confirm your visit</h3><p>We will contact you to confirm the best time and way to connect.</p></article><article><h3>You get a tailored estimate</h3><p>You will receive clear guidance based on your project, space, and goals.</p></article></div>
      </section>

      <footer><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /><div><p>Residential · Commercial · Gymnasiums</p><a href={instagram} target="_blank" rel="noreferrer">Instagram</a><a href="/privacy">Privacy Notice</a><a href="/terms">Marketing Communications Terms</a></div><p>Serving New York<br />© {new Date().getFullYear()} Distinct Hardwood Flooring, Inc.</p></footer>
      <dialog className="estimate-success-dialog" ref={successDialog} aria-labelledby="success-dialog-title" onCancel={(event) => { event.preventDefault(); closeSuccessModal(); }} onClose={() => setSuccessModalOpen(false)}>
        <div className="success-dialog-content">
          <CheckCircle2 aria-hidden="true" />
          <p className="form-kicker">Request received</p>
          <h2 id="success-dialog-title">Thank you. We have your estimate request.</h2>
          <p>Distinct Hardwood Flooring, Inc. will call or text you within 24–48 business hours to talk through your project.</p>
          <button className="button button-olive" type="button" onClick={closeSuccessModal}>Done</button>
        </div>
      </dialog>
    </main>
  );
}
