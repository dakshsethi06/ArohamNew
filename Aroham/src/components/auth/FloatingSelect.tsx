import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GOLD, SANS } from "@/constants/theme";

export function FloatingSelect({ label, options, value, onChange }: {
  label:string; options:string[]; value:string; onChange:(v:string)=>void;
}) {
  const [focused,setFocused]=useState(false);
  const active=focused||value.length>0;
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        className="w-full pt-6 pb-2 px-4 rounded-2xl text-sm outline-none transition-all duration-200 appearance-none"
        style={{ background:"#FFFFFF", border:`1.5px solid ${focused?GOLD:"rgba(91,31,36,0.14)"}`,
          boxShadow:focused?`0 0 0 3px rgba(200,160,68,0.1)`:"none",
          color:value?"#222222":"#9A8A78", fontFamily:SANS }}>
        <option value="">Select {label}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <label className="absolute left-4 pointer-events-none transition-all duration-200"
        style={{ top:active?"8px":"50%", transform:active?"translateY(0)":"translateY(-50%)",
          fontSize:active?"10px":"13px", color:focused?GOLD:"#9A8A78", fontFamily:SANS,
          fontWeight:active?600:400, letterSpacing:active?"0.06em":"0",
          textTransform:active?"uppercase":"none" }}>
        {label}
      </label>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"#9A8A78"}}/>
    </div>
  );
}
