"use client";

import { useEffect, useState, useCallback } from "react";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";
import Pagination from "./components/Pagination";
import ExportManager from "./components/ExportManager";

export type Transaction = {
  id: number;
  transaction_date: string;
  domain: string;
  location: string;
  value: number;
  transaction_count: number;
};

export default function Home() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination & Filters State
  const [cursor, setCursor] = useState<number | null>(null);
  const [cursorStack, setCursorStack] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({
    domain: "",
    location: "",
    fromDate: "",
    toDate: "",
  });

  const ITEMS_PER_PAGE = 30;

  const fetchData = useCallback(
    async (targetCursor: number | null = null, controller?: AbortController) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          limit: ITEMS_PER_PAGE.toString(),
          ...(targetCursor && { cursor: targetCursor.toString() }),
          ...(appliedFilters.domain && { domain: appliedFilters.domain }),
          ...(appliedFilters.location && { location: appliedFilters.location }),
        });

        if (appliedFilters.fromDate && appliedFilters.toDate) {
          params.append("fromDate", appliedFilters.fromDate);
          params.append("toDate", appliedFilters.toDate);
        }

        const res = await fetch(`/api/transactions?${params.toString()}`, {
          signal: controller?.signal
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        setData(result.data || []);
        setCursor(result.nextCursor ?? null);
        setTotalCount(result.meta?.totalCount || 0);
      } catch (err: any) {
        if (err.name !== 'AbortError') setError("Unable to load transactions.");
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(null, controller);
    return () => controller.abort();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaction Ledger</h1>
            <p className="text-slate-500 text-sm">Review and export global records.</p>
          </div>
          {/* Global Export Action */}
          <ExportManager 
            appliedFilters={appliedFilters} 
            hasData={data.length > 0} 
          />
        </header>

        {/* FILTER SECTION */}
        <FilterBar 
          onApply={(filters) => {
            setAppliedFilters(filters);
            setCursorStack([]); // Reset pagination on new filter
          }} 
        />

        {/* DATA SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable 
            data={data} 
            loading={loading} 
            onClearFilters={() => setAppliedFilters({domain: "", location: "", fromDate: "", toDate: ""})} 
          />
          
          <Pagination 
            currentPage={cursorStack.length + 1}
            totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            totalCount={totalCount}
            onNext={() => {
              if (cursor) {
                setCursorStack(prev => [...prev, cursor]);
                fetchData(cursor);
              }
            }}
            onPrev={() => {
              const newStack = [...cursorStack];
              newStack.pop();
              const prevCursor = newStack.length > 0 ? newStack[newStack.length - 1] : null;
              setCursorStack(newStack);
              fetchData(prevCursor);
            }}
            canNext={!!cursor && !loading}
            canPrev={cursorStack.length > 0 && !loading}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}