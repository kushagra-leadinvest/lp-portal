import { createClient } from "@/lib/supabase/server";
import { getAllUpdates, type Update } from "@/lib/queries";

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function UpdateCard({ update }: { update: Update }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-xs text-gray-400 mb-1">{fmtDate(update.published_at)}</p>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{update.title}</h2>
      <p className="text-sm text-gray-600 whitespace-pre-line">{update.body}</p>
    </div>
  );
}

export default async function UpdatesPage() {
  const supabase = createClient();
  const updates = await getAllUpdates(supabase);

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900">Updates</h1>
      {updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">No updates published yet.</p>
        </div>
      ) : (
        updates.map((u) => <UpdateCard key={u.id} update={u} />)
      )}
    </div>
  );
}
