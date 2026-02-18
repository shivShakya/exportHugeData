import { Search, MapPin, Calendar, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function FilterBar({ onApply }: { onApply: (filters: any) => void }) {
  const [inputs, setInputs] = useState({ domain: "", location: "", fromDate: "", toDate: "" });
  const [options, setOptions] = useState<{ domains: any[], locations: any[] }>({ domains: [], locations: [] });

  useEffect(() => {
    fetch("/api/filters").then(res => res.json()).then(setOptions).catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <select 
          value={inputs.domain} 
          onChange={e => setInputs({...inputs, domain: e.target.value})}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-sm appearance-none"
        >
          <option value="">All Domains</option>
          {options.domains.map((d, i) => <option key={i} value={d.domain}>{d.domain}</option>)}
        </select>
      </div>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <select 
          value={inputs.location} 
          onChange={e => setInputs({...inputs, location: e.target.value})}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-sm appearance-none"
        >
          <option value="">All Locations</option>
          {options.locations.map((l, i) => <option key={i} value={l.location}>{l.location}</option>)}
        </select>
      </div>

      <input type="date" value={inputs.fromDate} onChange={e => setInputs({...inputs, fromDate: e.target.value})} className="bg-slate-50 rounded-lg p-2 text-sm" />
      <input type="date" value={inputs.toDate} onChange={e => setInputs({...inputs, toDate: e.target.value})} className="bg-slate-50 rounded-lg p-2 text-sm" />

      <div className="flex gap-2">
        <button onClick={() => onApply(inputs)} className="flex-1 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
          <Filter size={16} /> Apply
        </button>
        <button onClick={() => { setInputs({domain: "", location: "", fromDate: "", toDate: ""}); onApply({domain: "", location: "", fromDate: "", toDate: ""}); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}