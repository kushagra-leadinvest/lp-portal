"use client";
import { AS_OF_DATE, DOCUMENTS, type PortfolioDocument } from "@/lib/dummy-data";

const CATEGORY_LABELS: Record<PortfolioDocument["category"], string> = {
  subscription: "Legal",
  "quarterly-report": "Quarterly report",
  tax: "Tax",
  general: "General",
};

const CATEGORY_COLORS: Record<PortfolioDocument["category"], string> = {
  subscription: "bg-purple-50 text-purple-700",
  "quarterly-report": "bg-blue-50 text-blue-700",
  tax: "bg-amber-50 text-amber-700",
  general: "bg-gray-100 text-gray-600",
};

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function DocumentsPage() {
  const sorted = [...DOCUMENTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Legal documents and portfolio reports · As of {AS_OF_DATE}
            </p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            Dummy data · testing only
          </span>
        </div>
      </div>

      <section className="px-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {sorted.map((doc, i) => (
            <div
              key={doc.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group ${
                i < sorted.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <DocIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_COLORS[doc.category]}`}>
                    {CATEGORY_LABELS[doc.category]}
                  </span>
                  <span className="text-[11px] text-gray-400">{doc.displayDate}</span>
                  <span className="text-[11px] text-gray-300">·</span>
                  <span className="text-[11px] text-gray-400">{doc.size}</span>
                </div>
              </div>
              <button
                onClick={() => alert("Download coming soon — files will be uploaded by the fund manager.")}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#8B1A1A] transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 opacity-50 group-hover:opacity-100 flex-shrink-0"
                title="Download"
              >
                <DownloadIcon />
                <span className="hidden sm:block">Download</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-blue-700">
            Downloads are placeholder buttons in this test build. Real document files will be uploaded by the fund manager before this goes live.
          </p>
        </div>
      </section>

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Documents are for your records only and are not to be shared without prior consent. Questions?{" "}
          <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">
            kushagra@leadinvest.in
          </a>
        </p>
      </footer>
    </div>
  );
}
