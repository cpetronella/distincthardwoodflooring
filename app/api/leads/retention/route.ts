import {getLeadSession,isSuperadmin} from "../../../../lib/leads-auth";
import {smallJson} from "../../../../lib/request-security";
import {audit,classifications,retentionDue,type StoredLead} from "../../../../lib/retention";
const reasons=new Set(["customer-communication","estimate-scheduled","estimate-revised","work-performed","warranty-activity"]);
export async function PATCH(request:Request) {
  const user=await getLeadSession();
  if(!user)return Response.json({error:"Sign in required."},{status:401});
  if(!isSuperadmin(user))return Response.json({error:"Only superadmins can manage database records."},{status:403});
  try {
    const p=await smallJson(request),id=Number(p.id);
    if(!Number.isSafeInteger(id)||id<1)return Response.json({error:"Invalid record."},{status:400});
    const {rawDb}=await import("../../../../lib/raw-db"); const db=rawDb();
    const lead=await db.prepare("SELECT * FROM estimates WHERE id=?").bind(id).first<StoredLead>();
    if(!lead)return Response.json({error:"Contact not found."},{status:404});
    const now=new Date().toISOString();
    let classification=lead.classification,completion=lead.completed_at,activity=lead.last_activity_at||new Date(lead.created_at.includes("T")?lead.created_at:lead.created_at.replace(" ","T")+"Z").toISOString(),hold=lead.retention_hold,reason=lead.retention_hold_reason;
    const logs=[];
    if(p.action==="activity") {
      if(!reasons.has(String(p.reason)))return Response.json({error:"Choose the business activity."},{status:400});
      activity=now;logs.push(audit(db,id,user.id,"meaningful_activity",String(p.reason),now));
    } else if(p.action==="hold") {
      if(typeof p.hold!=="boolean")return Response.json({error:"Invalid hold."},{status:400});
      hold=p.hold?1:0;reason=hold&&typeof p.reason==="string"?p.reason.trim().slice(0,500):"";
      if(hold&&!reason)return Response.json({error:"A documented reason is required."},{status:400});
      logs.push(audit(db,id,user.id,hold?"retention_hold_added":"retention_hold_removed","",now));
    } else if(p.action==="classification") {
      classification=String(p.classification);
      if(!(classifications as readonly string[]).includes(classification))return Response.json({error:"Invalid classification."},{status:400});
      completion=classification==="completed-project"&&typeof p.completedAt==="string"?p.completedAt:"";
      if(classification==="completed-project"&&(!/^\d{4}-\d{2}-\d{2}$/.test(completion)||!Number.isFinite(Date.parse(completion))||new Date(completion).toISOString().slice(0,10)!==completion||completion>now.slice(0,10)))return Response.json({error:"Enter the actual project completion date, not a future date."},{status:400});
      if(classification!==lead.classification && lead.classification!=="review-required")activity=now;
      logs.push(audit(db,id,user.id,"classification_changed",JSON.stringify({from:lead.classification,to:classification}),now));
    } else return Response.json({error:"Invalid action."},{status:400});
    const due=retentionDue(classification,activity,completion),category=classification==="prospect"?"unconverted-two-years":classification==="completed-project"?"completed-seven-years":classification;
    await db.batch([db.prepare("UPDATE estimates SET classification=?,completed_at=?,last_activity_at=?,retention_category=?,retention_due_at=?,retention_hold=?,retention_hold_reason=? WHERE id=?").bind(classification,completion,activity,category,due,hold,reason,id),...logs]);
    return Response.json({ok:true});
  }catch{return Response.json({error:"Unable to save retention settings."},{status:500});}
}
