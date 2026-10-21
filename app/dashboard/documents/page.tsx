import { getDocuments } from "@/lib/queries";
import { AS_OF_DATE } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { redirect } from "next/navigation";

type Doc = {
  id: string;
  name: string;
  document_type: string | null;
  uploaded_at: string;
  storage_path: string;
};

export default async function DocumentsPage() {
  const data = await getDocuments();
  if (!data) redirect("/login");

  const documents = data as unknown as Doc[];

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
            <p className="text-xs text-gray-400 mt-0.5">Fund reports, capital call notices, and statements · As of {AS_OF_DATE}</p>
          </div>
        </div>
      </div>

      <section className="px-8 mb-8">
        {documents.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl px-6 py-12 text-center">
            <svg className="mx-auto mb-3 text-gray-200" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm text-gray-400">No documents yet</p>
            <p className="text-xs text-gray-300 mt-1">Fund documents will appear here once uploaded by the fund manager.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {doc.document_type ?? "Document"} · {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-4 flex-shrink-0">Downloads coming soon</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Documents are shared by Lead Invest on a best-effort basis. For missing documents, contact{" "}
          <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">kushagra@leadinvest.in</a>
        </p>
      </footer>
    </div>
  );
}
