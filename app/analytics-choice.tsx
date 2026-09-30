'use client';
import {useEffect,useState,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {measurementId,publicPages,analyticsReady,isProductionHost} from '../lib/analytics';

export function AnalyticsChoice() {
  const path = usePathname();
  const [choice,setChoice] = useState('');
  const [open,setOpen] = useState(false);
  const [blocked,setBlocked] = useState(false);
  const lastPage = useRef('');
  useEffect(()=>{
    // Read browser-only preferences after hydration without changing server markup.
    const timer=window.setTimeout(()=>{
    const privacySignal = navigator.doNotTrack === '1' || !!(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl;
    setBlocked(privacySignal);
    try { const saved=localStorage.getItem('dhf-analytics') || ''; setChoice(saved); setOpen(!saved && !privacySignal); } catch { setChoice('rejected'); }
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);
  useEffect(()=>{
    const enabled = analyticsReady && isProductionHost() && !!publicPages[path] && choice==='accepted' && !blocked;
    (window as unknown as Record<string,unknown>)[`ga-disable-${measurementId}`]=!enabled;
    if (!enabled) { lastPage.current=''; return; }
    window.dataLayer ||= [];
    // Google tag's documented queue consumes the function arguments object.
    // eslint-disable-next-line prefer-rest-params
    window.gtag ||= function(){ window.dataLayer!.push(arguments); };
    if (!document.getElementById('dhf-ga')) window.gtag('js',new Date());
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('set',{allow_google_signals:false,allow_ad_personalization_signals:false});
    const safePage={page_location:`https://distincthardwoodflooring.com${path}`,page_title:publicPages[path],page_referrer:''};
    window.gtag('config',measurementId,{...safePage,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,ignore_referrer:true,cookie_expires:60*60*24*90,cookie_update:false,campaign_id:'',campaign_source:'',campaign_medium:'',campaign_name:'',campaign_term:'',campaign_content:''});
    if (!document.getElementById('dhf-ga')) {
      const script=document.createElement('script'); script.id='dhf-ga'; script.async=true; script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`; script.referrerPolicy='no-referrer'; document.head.appendChild(script);
    }
    if (lastPage.current !== path) window.gtag('event','page_view',{...safePage,send_to:measurementId});
    lastPage.current = path;
    return ()=>{ (window as unknown as Record<string,unknown>)[`ga-disable-${measurementId}`]=true; };
  },[path,choice,blocked]);
  function choose(value:string) {
    try {localStorage.setItem('dhf-analytics',value);} catch {}
    if(value==='rejected') {
      (window as unknown as Record<string,unknown>)[`ga-disable-${measurementId}`]=true;
      window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      for(const cookie of document.cookie.split(';')) {
        const name=cookie.split('=')[0].trim();
        if(!/^_ga(?:_|$)/.test(name)) continue;
        for(const domain of ['',location.hostname,'.'+location.hostname]) document.cookie=`${name}=; Max-Age=0; Path=/;${domain?' Domain='+domain+';':''} SameSite=Lax; Secure`;
      }
    }
    setChoice(value);setOpen(false);
  }
  if(!publicPages[path]) return null;
  if(!analyticsReady) return <aside className="analytics-choice" aria-label="Analytics privacy choices"><p>Optional analytics is currently paused. No new analytics data is collected by this site.</p><button type="button" onClick={()=>choose('rejected')}>Clear analytics preference and cookies</button><a href="/privacy">Privacy Notice</a></aside>;
  return <aside className={open ? "analytics-choice analytics-choice-open" : "analytics-choice"} aria-label="Analytics privacy choices">
    {open ? <><p>Allow optional analytics cookies? They help us measure visits and completed estimate requests. We do not send your form details to Google Analytics.</p><div><button type="button" onClick={()=>choose('rejected')}>No thanks</button><button type="button" disabled={blocked} onClick={()=>choose('accepted')}>Allow analytics</button><a href="/privacy">Privacy Notice</a></div>{blocked && <p>Your browser privacy signal keeps analytics off.</p>}</> : <button type="button" onClick={()=>setOpen(true)}>Analytics preferences{blocked?' (off)':''}</button>}
  </aside>;
}
