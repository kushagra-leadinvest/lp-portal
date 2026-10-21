import { redirect } from "next/navigation";
import { getUpdates } from "@/lib/queries";
import { AS_OF_DATE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function UpdatesPage() {
  const data = await getUpdates();
  if (!data) redirect("/login");

  const { updates, schemes } = data;

  const schemeMap: Record<string, string> = {};
  for (const s of schemes) schemeMap[s.id] = s.name;

  const byQuarter: Record<string, typeof updates> = {};
  for (const u of updates) {
    const q = u.quarter ?? "General";
    if (!byQuarter[q]) byQuarter[q] = [];
    byQuarter[q].push(u);
  }
  const quarters = Object.keys(byQuarter).sort((a, b) => {
    const parseQ = (s: string) => {
      const m = s.match(/Q(\d)\s+FY(\d+)/i);
      return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : -1;
    };
    return parseQ(b) - parseQ(a);
  });

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Portfolio Updates</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Published updates from the fund manager · As of {AS_OF_DATE}
            </p>
          </div>
        </div>
      </div>

      <section className="px-8 mb-8">
        {updates.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl px-6 py-10 text-center">
            <svg className="mx-auto mb-3 text-gray-200" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            <p className="text-sm text-gray-400">No updates yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Portfolio updates will appear here once published by the fund manager.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {quarters.map((quarter) => (
              <div key={quarter}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {quarter}
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[11px] text-gray-400">
                    {byQuarter[quarter].length} update{byQuarter[quarter].length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {byQuarter[quarter].map((update) => {
                    const schemeIds = update.scheme_ids as string[] | null;
                    const primarySchemeId = schemeIds?.[0] ?? null;
                    const companyName = primarySchemeId ? schemeMap[primarySchemeId] : null;
                    const initial = companyName ? companyName.charAt(0).toUpperCase() : "L";

                    return (
                      <article
                        key={update.id}
                        className="bg-white border border-gray-200 rounded-xl px-6 py-5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#8B1A1A] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                              {initial}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {companyName ?? "Portfolio update"}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {update.published_at ? formatDate(update.published_at) : "—"}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                            {quarter}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-800 mb-1">{update.title}</p>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {update.content}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Updates are published by Lead Invest on a best-effort basis after each quarter-end. For
          questions, contact{" "}
          <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">
            kushagra@leadinvest.in
          </a>
        </p>
      </footer>
    </div>
  );
}
