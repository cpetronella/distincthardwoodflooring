import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {trackEstimateSuccess,publicPages,analyticsReady} from "../lib/analytics.ts";
test("analytics is enabled after Google automatic-event settings were verified",()=>{
assert.equal(analyticsReady,true);trackEstimateSuccess();
});
test("analytics excludes private routes and event contains only fixed public data",{skip:!analyticsReady},()=>{
assert.equal(publicPages["/leads"],undefined);
const events=[];
globalThis.window={location:{hostname:"distincthardwoodflooring.com",pathname:"/",search:"?email=qa@example.com",hash:"#private"},gtag:(...args)=>events.push(args)};
globalThis.localStorage={getItem:()=>"accepted"};
const old=Object.getOwnPropertyDescriptor(globalThis,"navigator");
Object.defineProperty(globalThis,"navigator",{configurable:true,value:{doNotTrack:"0",globalPrivacyControl:false}});
trackEstimateSuccess();assert.equal(events.length,1);assert.equal(events[0][1],"estimate_form_submit");
assert.deepEqual(Object.keys(events[0][2]).sort(),["page_location","page_referrer","page_title","send_to"]);
assert.equal(events[0][2].page_location,"https://distincthardwoodflooring.com/");
assert.ok(!JSON.stringify(events).includes("qa@example.com"));
window.location.pathname="/leads";trackEstimateSuccess();assert.equal(events.length,1);
window.location.pathname="/";navigator.doNotTrack="1";trackEstimateSuccess();assert.equal(events.length,1);
navigator.doNotTrack="0";navigator.globalPrivacyControl=true;trackEstimateSuccess();assert.equal(events.length,1);
navigator.globalPrivacyControl=false;localStorage.getItem=()=>"rejected";trackEstimateSuccess();assert.equal(events.length,1);
delete globalThis.window;delete globalThis.localStorage;if(old)Object.defineProperty(globalThis,"navigator",old);
});
test("success event follows confirmed response and never executes in error path",()=>{
const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const check=page.indexOf('if (!response.ok || !(await response.json() as {ok?: boolean}).ok)'),event=page.indexOf("trackEstimateSuccess();"),catchAt=page.indexOf("} catch",check);
assert.ok(check>0&&event>check&&event<catchAt);
const analytics=readFileSync(new URL("../app/analytics-choice.tsx",import.meta.url),"utf8");
assert.match(analytics,/send_page_view:false/);assert.match(analytics,/allow_google_signals:false/);assert.match(analytics,/allow_ad_personalization_signals:false/);assert.doesNotMatch(analytics,/location\.search|location\.href|document\.referrer|user_id/);
});
