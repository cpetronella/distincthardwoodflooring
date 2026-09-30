export const measurementId = 'G-ZLD0HX8W00';
// Verified in GA: only page loads remain; all optional enhanced events and history views are off.
export const analyticsReady = true;
export function isProductionHost() {
  return typeof window !== 'undefined' && ['distincthardwoodflooring.com', 'www.distincthardwoodflooring.com'].includes(window.location.hostname);
}
export const publicPages: Record<string,string> = {'/':'Flooring estimates','/privacy':'Privacy Notice','/terms':'Marketing Communications Terms'};
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args:unknown[])=>void; } }
export function trackEstimateSuccess() {
  if (!analyticsReady || !isProductionHost() || typeof window === 'undefined' || window.location.pathname !== '/') return;
  try {
    if (localStorage.getItem('dhf-analytics') !== 'accepted' || navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl) return;
    window.gtag?.('event','estimate_form_submit',{send_to:measurementId,page_location:'https://distincthardwoodflooring.com/',page_title:publicPages['/'],page_referrer:''});
  } catch { /* Analytics must never affect the estimate request. */ }
}
