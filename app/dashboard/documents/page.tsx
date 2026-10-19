import { createClient } from "@/lib/supabase/server";
import { getDocuments, type Document } from "@/lib/queries";

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DocRow({ doc }: { doc: Document }) {
  return (
    <div className="flex items-center justify-between py-4 border-t border-gray-100 first:border-t-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
          <p className="text-xs text-gray-400">
            {doc.document_type ?? "Document"} · {fmtDate(doc.uploaded_at)}
          </p>
        </div>
      </div>
      <span className="text-xs text-gray-400 italic">
        Download available soon
      </span>
    </div>
  );
}

export default async function DocumentsPage() {
  const supabase = createClient();
  const documents = await getDocuments(supabase);

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900">Documents</h1>

      <div className="bg-white rounded-xl border border-gray-200 px-5">
        {documents.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          </div>
        ) : (
          documents.map((doc) => <DocRow key={doc.id} doc={doc} />)
        )}
      </div>

      <p className="text-xs text-gray-400">
        Document downloads will be enabled in a future update. Contact your
        relationship manager for any document requests.
      </p>
    </div>
  );
}
