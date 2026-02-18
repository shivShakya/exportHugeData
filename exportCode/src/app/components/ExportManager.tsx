"use client";

import { useState } from "react";
import { Download, Loader2, FileCheck } from "lucide-react";

interface ExportManagerProps {
  appliedFilters: {
    domain: string;
    location: string;
    fromDate: string;
    toDate: string;
  };
  hasData: boolean;
}

export default function ExportManager({ appliedFilters, hasData }: ExportManagerProps) {
  const [showDownloads, setShowDownloads] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [readyExports, setReadyExports] = useState<string[]>([]);

  async function startExport() {
    try {
      setIsExporting(true);
      setExportProgress(5);

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appliedFilters),
      });

      if (!res.ok) throw new Error("Export failed to initiate");
      
      const { exportId } = await res.json();

      // Polling Logic
      let completed = false;
      while (!completed) {
        await new Promise((r) => setTimeout(r, 2000));

        const statusRes = await fetch(`/api/export/${exportId}/status`);
        if (!statusRes.ok) break;

        const statusData = await statusRes.json();
        setExportProgress(statusData.progress || 20);

        if (statusData.status === "completed") {
          setReadyExports((prev) => [exportId, ...prev]);
          setShowDownloads(true); // Pop open the menu when ready
          completed = true;
        } else if (statusData.status === "failed") {
          throw new Error("Generation failed on server");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Export failed.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Step 1: The "Start Export" Trigger */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <button
          onClick={startExport}
          disabled={isExporting || !hasData}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 disabled:opacity-50 transition-colors"
        >
          {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          {isExporting ? `Exporting... ${exportProgress}%` : "Export View"}
        </button>

        {isExporting && (
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Step 2: The "Downloads List" Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDownloads(!showDownloads)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FileCheck size={18} className={readyExports.length > 0 ? "text-green-600" : "text-slate-400"} />
          <span className="text-sm font-medium">History</span>
          {readyExports.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {readyExports.length}
            </span>
          )}
        </button>

        {showDownloads && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="p-3 border-b bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              Available Downloads
            </div>
            {readyExports.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No ready files</div>
            ) : (
              readyExports.map((id) => (
                <div key={id} className="p-3 flex items-center justify-between border-b last:border-0 hover:bg-slate-50">
                  <span className="text-[10px] font-mono text-slate-500">ID: {id.slice(0, 8)}</span>
                  <button 
                    onClick={() => window.open(`/api/export/${id}/download`)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}