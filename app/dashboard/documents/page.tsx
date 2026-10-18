export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Your contribution agreements and statements</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <p className="text-gray-400 text-sm">No documents available yet.</p>
        <p className="text-gray-400 text-xs mt-1">Documents will appear here once uploaded by the Lead Invest team.</p>
      </div>
    </div>
  );
}