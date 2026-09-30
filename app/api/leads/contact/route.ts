import {getLeadSession,isSuperadmin} from "../../../../lib/leads-auth";
import {smallJson} from "../../../../lib/request-security";
import {removePersonalData} from "../../../../lib/retention";
const removalReasons=new Set(["customer-request","created-in-error","other-reviewed-need"]);
export async function DELETE(request:Request) {
  const user=await getLeadSession();
  if(!user)return Response.json({error:"Sign in required."},{status:401});
  if(!isSuperadmin(user))return Response.json({error:"Only superadmins can permanently delete records."},{status:403});
  try {
    const p=await smallJson(request),id=Number(p.id);
    if(!Number.isSafeInteger(id)||id<1||p.confirm!==true||p.reviewed!==true||typeof p.confirmationName!=="string"||!removalReasons.has(String(p.reason)))return Response.json({error:"Complete the removal review and type the customer's full name."},{status:400});
    const {rawDb}=await import("../../../../lib/raw-db");
    const db=rawDb();
    const lead=await db.prepare("SELECT name FROM estimates WHERE id=?").bind(id).first<{name:string}>();
    if(!lead||p.confirmationName!==lead.name)return Response.json({error:"The name did not match the record."},{status:409});
    const ok=await removePersonalData(db,id,user.id,false,new Date().toISOString(),false,String(p.reason));
    return Response.json(ok?{ok:true}:{error:"Classify this record and resolve any active project or retention hold before removal."},{status:ok?200:409});
  } catch {return Response.json({error:"Unable to remove personal data."},{status:500});}
}
