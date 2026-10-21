"use client";

export default function DownloadButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7a1616] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors print:hidden"
    >
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF
    </button>
  );
}
