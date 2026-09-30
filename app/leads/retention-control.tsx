"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
type RecordSettings={id:number;classification:string;completedAt:string;lastActivityAt:string;retentionDueAt:string;retentionHold:boolean;retentionHoldReason:string};

export function RetentionCountdown({lead,asOf}:{lead:RecordSettings;asOf:string}) {
  const [now,setNow]=useState(asOf);
  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(new Date().toISOString()),60_000);
    return ()=>window.clearInterval(timer);
  },[]);
  const due=Date.parse(lead.retentionDueAt);
  const remaining=due-Date.parse(now);
  let title:string,detail:string,state="standard";
  if(lead.retentionHold) {
    title="On hold";
    detail="Automatic cleanup is paused until the hold is removed.";
    state="paused";
  } else if(lead.classification==="review-required") {
    title="Review needed";
    detail="Choose the project classification to set an eligibility date.";
    state="paused";
  } else if(lead.classification==="active-project") {
    title="Active project";
    detail="No automatic cleanup while this project is active.";
    state="paused";
  } else if(!Number.isFinite(due)) {
    title="No date scheduled";
    detail="Review this record's lifecycle settings.";
    state="paused";
  } else {
    title=remaining<=0?"Eligible now":remaining<86_400_000?"Less than a day left":`${Math.ceil(remaining/86_400_000)} ${Math.ceil(remaining/86_400_000)===1?"day":"days"} left`;
    detail=lead.classification==="prospect"?"If no meaningful business activity occurs, eligible ":"Eligible ";
    state=remaining<=0?"eligible":"standard";
  }
  const eligibleDate=Number.isFinite(due)?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"America/New_York"}).format(new Date(due)):"";
  return <div className="lead-retention-countdown" data-state={state}>
    <strong>Retention · {title}</strong>
    <span>{detail}{state==="standard"||state==="eligible"?<><time dateTime={lead.retentionDueAt}>{eligibleDate}</time>. Cleanup may happen later.</>:null}</span>
  </div>;
}

export function RetentionControl({lead}:{lead:RecordSettings}) {
  const router=useRouter();
  const [classification,setClassification]=useState(lead.classification);
  const [completion,setCompletion]=useState(lead.completedAt.slice(0,10));
  const [reason,setReason]=useState(lead.retentionHoldReason);
  const [activity,setActivity]=useState("customer-communication");
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function save(payload:Record<string,unknown>) {
    setBusy(true);setMessage("");
    try {
      const r=await fetch("/api/leads/retention",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:lead.id,...payload})});
      const data=await r.json() as {error?: string};
      if(!r.ok)throw new Error(data.error||"Not saved.");
      setMessage("Saved.");router.refresh();
    }catch(e){setMessage(e instanceof Error?e.message:"Not saved.");}finally{setBusy(false);}
  }
  return <details className="lead-record-details">
    <summary>Record lifecycle &amp; retention{lead.retentionHold?" · On hold":lead.classification==="review-required"?" · Review needed":""}</summary>
    <p>Estimate status is separate from project completion. Views, logins, exports and preference changes do not extend retention.</p>
    <dl><dt>Last meaningful activity</dt><dd>{lead.lastActivityAt?new Date(lead.lastActivityAt).toLocaleDateString("en-US"):"Needs review of existing records"}</dd><dt>Deletion eligibility</dt><dd>{lead.retentionHold?"Paused by hold":lead.retentionDueAt?new Date(lead.retentionDueAt).toLocaleDateString("en-US"):lead.classification==="active-project"?"Retained while active":"Not scheduled until classified"}</dd></dl>
    <div className="retention-grid"><label>Project classification<select value={classification} onChange={e=>setClassification(e.target.value)} disabled={busy}><option value="review-required">Needs review</option><option value="prospect">Prospect / unconverted</option><option value="active-project">Customer / active project</option><option value="completed-project">Completed project</option></select></label>
    {classification==="completed-project"&&<label>Actual project completion<input type="date" value={completion} max={new Date().toISOString().slice(0,10)} onChange={e=>setCompletion(e.target.value)} disabled={busy}/></label>}
    <button type="button" disabled={busy} onClick={()=>save({action:"classification",classification,completedAt:completion})}>Save classification</button></div>
    <div className="retention-grid"><label>Business activity completed today<select value={activity} onChange={e=>setActivity(e.target.value)} disabled={busy}><option value="customer-communication">Actual customer communication</option><option value="estimate-scheduled">Estimate scheduled</option><option value="estimate-revised">Estimate revised</option><option value="work-performed">Work performed</option><option value="warranty-activity">Warranty activity</option></select></label><button type="button" disabled={busy} onClick={()=>save({action:"activity",reason:activity})}>Record activity</button></div>
    <div className="retention-grid"><label>Retention hold reason<input value={reason} maxLength={500} onChange={e=>setReason(e.target.value)} placeholder="Dispute, warranty, legal obligation…" disabled={busy}/></label><button type="button" disabled={busy} onClick={()=>{if(lead.retentionHold&&!window.confirm("Remove this hold? An expired record may be deleted by the next cleanup."))return;void save({action:"hold",hold:!lead.retentionHold,reason});}}>{lead.retentionHold?"Remove retention hold":"Place retention hold"}</button></div>
    <p role="status">{busy?"Saving…":message}</p>
  </details>;
}
