import { marketingConsentRecord, marketingConsentSource, marketingConsentVersion } from "../../../lib/marketing-consent";
import { smallJson } from "../../../lib/request-security";
import { retentionDue, normalizeContact } from "../../../lib/retention";
import { titleCase } from "../../../lib/title-case";
const states=new Set(["NY","NJ","CT"]);
const services=new Set(["New hardwood installation","Sanding and refinishing","Gymnasium flooring","Commercial flooring","Not sure yet",""]);
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
const zipMatchesState=(zip:string,state:string)=>{const prefix=Number(zip.slice(0,3));return state==="NY"?(prefix===5||prefix===63||(prefix>=100&&prefix<=149)):state==="NJ"?(prefix>=70&&prefix<=89):state==="CT"?(prefix>=60&&prefix<=69):false};
export async function POST(request:Request) {
  let p:Record<string,unknown>;
  try {p=await smallJson(request);} catch {return Response.json({error:"Please check your request."},{status:400});}
  const first=titleCase(clean(p.firstName,60)), last=titleCase(clean(p.lastName,60)), phone=normalizeContact("phone",clean(p.phone,40)),email=normalizeContact("email",clean(p.email,180)),address=titleCase(clean(p.address,240)),city=titleCase(clean(p.city,100)),state=clean(p.state,2).toUpperCase(),zip=clean(p.zipCode,10),service=clean(p.service,120),details=typeof p.details==="string"?p.details.trim():"";
  const customerType=typeof p.customerType==="string"?p.customerType:"", customerTypeOther=typeof p.customerTypeOther==="string"?p.customerTypeOther.trim():"";
  if(details.length>500) return Response.json({error:"Please keep your project description to 500 characters or fewer."},{status:400});
  if(!["homeowner","contractor","other"].includes(customerType) || (customerType==="other" && (!customerTypeOther || customerTypeOther.length>500))) return Response.json({error:"Please select who you are and describe Other if selected, using 500 characters or fewer."},{status:400});
  if(!first||!last||!/^\d{10}$/.test(phone)||!/^\S+@\S+\.\S+$/.test(email)||!/^\d+[A-Za-z]?\s+\S+/.test(address)||!/^[A-Za-z][A-Za-z .'-]{1,99}$/.test(city)||!states.has(state)||!/^\d{5}(?:-\d{4})?$/.test(zip)||!zipMatchesState(zip,state)||!services.has(service)) return Response.json({error:"Please enter a complete service address in New York, New Jersey, or Connecticut."},{status:400});
  if(p.website) return Response.json({error:"Please try again."},{status:400});
  try {
    const {rawDb}=await import("../../../lib/raw-db");
    const db=rawDb(),now=new Date().toISOString();
    const clientIp=request.headers.get("cf-connecting-ip");
    if(clientIp) {
      const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(now.slice(0,13)+":"+clientIp));
      const key="form:"+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
      const count=await db.prepare("INSERT INTO dashboard_login_throttles(key,attempts,updated_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 RETURNING attempts").bind(key,now).first<{attempts:number}>();
      if(count && count.attempts>20)return Response.json({error:"Too many requests. Please try again later or contact the business."},{status:429,headers:{"Retry-After":"3600"}});
    }
    // Public form collects optional project details but no billing or appointment data.
    await db.batch([
      db.prepare(`INSERT INTO estimates (name,first_name,last_name,phone,email,address,city,state,zip_code,service,details,customer_type,customer_type_other,consent,email_marketing_consent,phone_marketing_consent,marketing_consent_captured_at,marketing_consent_version,marketing_consent_text,marketing_consent_source,status,last_activity_at,classification,retention_category,retention_due_at,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,
        CASE WHEN ?=1 AND NOT EXISTS(SELECT 1 FROM marketing_suppressions WHERE channel='email' AND contact=?) THEN 1 ELSE 0 END,
        CASE WHEN ?=1 AND NOT EXISTS(SELECT 1 FROM marketing_suppressions WHERE channel='phone' AND contact=?) THEN 1 ELSE 0 END,
        ?,?,?,?,'new-business',?,'prospect','unconverted-two-years',?,?)`).bind(first+" "+last,first,last,phone,email,address,city,state,zip,service,details,customerType,customerType==="other"?customerTypeOther:"",p.emailMarketingConsent==="yes"?1:0,email,p.phoneMarketingConsent==="yes"?1:0,phone,now,marketingConsentVersion,marketingConsentRecord,marketingConsentSource,now,retentionDue("prospect",now),now),
      db.prepare(`INSERT INTO audit_events(lead_id,action,details,created_at) SELECT id,'consent_recorded',json_object('service',consent,'email',email_marketing_consent,'sms',phone_marketing_consent,'version',marketing_consent_version,'source',marketing_consent_source),? FROM estimates WHERE id=last_insert_rowid()`).bind(now),
    ]);
    return Response.json({ok:true},{status:201});
  } catch {return Response.json({error:"Unable to save your request. Please try again or contact the business."},{status:500});}
}
