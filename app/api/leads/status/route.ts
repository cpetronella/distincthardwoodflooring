import {getLeadSession} from "../../../../lib/leads-auth";
import {smallJson} from "../../../../lib/request-security";
import {audit,retentionDue,type StoredLead} from "../../../../lib/retention";
export async function PATCH(request:Request) {
  const user=await getLeadSession();
  if(!user)return Response.json({error:"Sign in required."},{status:401});
  try {
    const p=await smallJson(request),id=Number(p.id),status=String(p.status);
    if(!Number.isSafeInteger(id)||id<1||!["new-business","estimate-complete","missed-opportunity"].includes(status))return Response.json({error:"Invalid update."},{status:400});
    const {rawDb}=await import("../../../../lib/raw-db"); const db=rawDb();
    const lead=await db.prepare("SELECT * FROM estimates WHERE id=?").bind(id).first<StoredLead>();
    if(!lead)return Response.json({error:"Contact not found."},{status:404});
    let amount=lead.estimate_amount_cents;
    if(status==="estimate-complete") {
      const value=Number(p.estimateAmount);
      if(!Number.isFinite(value)||value<=0||value>10000000)return Response.json({error:"Enter a valid estimate amount."},{status:400});
      amount=Math.round(value*100);
    }
    if(status===lead.status && amount===lead.estimate_amount_cents)return Response.json({ok:true});
    const now=new Date().toISOString(),due=retentionDue(lead.classification,now,lead.completed_at);
    const statements=[db.prepare("UPDATE estimates SET status=?,estimate_amount_cents=?,last_activity_at=?,retention_due_at=? WHERE id=?").bind(status,amount,now,due,id)];
    if(status!==lead.status)statements.push(audit(db,id,user.id,"status_changed",JSON.stringify({from:lead.status,to:status}),now));
    if(amount!==lead.estimate_amount_cents)statements.push(audit(db,id,user.id,"estimate_changed","",now));
    await db.batch(statements);
    return Response.json({ok:true});
  }catch{return Response.json({error:"Unable to update this lead."},{status:500});}
}
