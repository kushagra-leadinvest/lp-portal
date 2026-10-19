import { AS_OF_DATE, PUBLISHED_UPDATES } from "@/lib/dummy-data";

export default function UpdatesPage() {
  const sorted = [...PUBLISHED_UPDATES].sort((a, b) => b.date.localeCompare(a.date));

  const byQuarter: Record<string, typeof sorted> = {};
  sorted.forEach((u) => {
    if (!byQuarter[u.quarter]) byQuarter[u.quarter] = [];
    byQuarter[u.quarter].push(u);
  });
  const quarters = Object.keys(byQuarter);

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
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            Dummy data · testing only
          </span>
        </div>
      </div>

      <section className="px-8 mb-8">
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
                {byQuarter[quarter].map((update) => (
                  <article
                    key={update.id}
                    className="bg-white border border-gray-200 rounded-xl px-6 py-5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#8B1A1A] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {update.company.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{update.company}</p>
                          <p className="text-[11px] text-gray-400">{update.displayDate}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {quarter}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{update.body}</p>
                    <p className="text-[11px] text-gray-400 mt-3">
                      Published by {update.publishedBy} · {new Date(update.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
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
