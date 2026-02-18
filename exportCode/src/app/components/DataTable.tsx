import { MapPin, Search } from "lucide-react";
import { Transaction } from "../page";

interface Props {
  data: Transaction[];
  loading: boolean;
  onClearFilters: () => void;
}

export default function DataTable({ data, loading, onClearFilters }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Domain</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4 text-right">Value</th>
            <th className="px-6 py-4 text-center">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/30" /></tr>
            ))
          ) : data.length > 0 ? (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors text-sm">
                <td className="px-6 py-4 text-slate-600">{row.transaction_date}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{row.domain}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                    <MapPin size={12} /> {row.location}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium text-indigo-600">${row.value.toLocaleString()}</td>
                <td className="px-6 py-4 text-center text-slate-500">{row.transaction_count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search size={24} className="text-slate-400" />
                  <p className="text-slate-900 font-medium">No transactions found</p>
                  <button onClick={onClearFilters} className="text-indigo-600 text-sm font-bold">Clear All</button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}