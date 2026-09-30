import {getLeadSession} from "../../../../lib/leads-auth";
import {smallJson} from "../../../../lib/request-security";
import {audit,normalizeContact} from "../../../../lib/retention";
export async function PATCH(request:Request) {
  const user=await getLeadSession();
  if(!user)return Response.json({error:"Sign in required."},{status:401});
  try {
    const p=await smallJson(request),id=Number(p.id),channel=p.channel;
    if(!Number.isSafeInteger(id)||id<1||!["email","phone"].includes(String(channel)))return Response.json({error:"Invalid preference."},{status:400});
    const {rawDb}=await import("../../../../lib/raw-db"); const db=rawDb();
    const lead=await db.prepare("SELECT email,phone FROM estimates WHERE id=?").bind(id).first<{email:string;phone:string}>();
    if(!lead)return Response.json({error:"Contact not found."},{status:404});
    const contact=normalizeContact(String(channel),channel==="email"?lead.email:lead.phone),now=new Date().toISOString();
    const column=channel==="email"?"email":"phone";
    const matches=await db.prepare(`SELECT id,${column} AS contact FROM estimates`).all<{id:number;contact:string}>();
    const ids=matches.results.filter(row=>normalizeContact(String(channel),row.contact)===contact).map(row=>row.id);
    await db.batch([
      db.prepare("INSERT INTO marketing_suppressions(channel,contact,opted_out_at,source) VALUES (?,?,?,'dashboard') ON CONFLICT(channel,contact) DO NOTHING").bind(channel,contact,now),
      ...ids.map(matchId=>db.prepare(`UPDATE estimates SET ${column}_marketing_consent=0,${column}_marketing_opted_out_at=? WHERE id=?`).bind(now,matchId)),
      ...ids.map(matchId=>audit(db,matchId,user.id,channel==="email"?"email_unsubscribe":"sms_opt_out")),
    ]);
    return Response.json({ok:true,optedOutAt:now});
  }catch{return Response.json({error:"Unable to save preference."},{status:500});}
}
